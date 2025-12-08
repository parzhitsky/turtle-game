import { parse } from './parse.js'
import { state } from './state.js'
import { Renderer } from './renderer.js'
import { CommandInput } from './command-input.js'
import { HistoryDisplay } from './history-display.js'
import { ControlPanel } from './control-panel.js'
import { Direction, Config } from './constants.js'

// DOM Elements
const canvas = document.getElementById('game-canvas')
const dinoElement = document.getElementById('dino')
const inputElement = document.getElementById('command-input')
const lineNumbersElement = document.getElementById('line-numbers')
const historyContainer = document.getElementById('history-list')
const runBtn = document.getElementById('btn-run')
const directionBtn = document.getElementById('btn-toggle-direction')
const speedSlider = document.getElementById('speed-slider')
const clearBtn = document.getElementById('btn-clear')

// Components
const renderer = new Renderer(canvas, dinoElement)
const commandInput = new CommandInput(inputElement, lineNumbersElement, {
  onEnter: handleRun
})

new HistoryDisplay(historyContainer, handleRevert, handleCopy)

// Initial focus
commandInput.focus()

// Control Panel & Speed
let animationSpeed = Config.DEFAULT_SPEED
const controlPanel = new ControlPanel({ runBtn, speedSlider, directionBtn, clearBtn }, {
  onRun: handleRun,
  onSpeedChange: (val) => { animationSpeed = val; },
  onToggleDirection: () => {
    renderer.toggleOverlay()
  },
  onClear: handleClearInput
})

// Main Loop State
let isAnimating = false
let executionQueue = [] // Queue of tasks: { type: 'MOVE', ... } or { type: 'SET_COLOR' }

function handleRun() {
  if (isAnimating) return

  const text = commandInput.getValue()
  if (!text.trim()) return

  const { commands, errors } = parse(text)

  if (errors.length > 0) {
    state.addCommandToHistory(`ERRORS:\n${errors.join('\n')}`, false)
    return
  }

  state.addCommandToHistory(text, true)
  commandInput.clear()
  commandInput.focus()

  // Add commands to queue
  executionQueue = [...commands]
  startAnimation()
}

function handleRevert(index) {
  if (isAnimating) return

  // Revert BEFORE command at index.
  state.setActiveCount(index)
  restoreState()
}

function handleCopy(text) {
  const current = commandInput.getValue()
  if (current.trim()) {
    if (!confirm('Replace current input?')) return
  }
  commandInput.setValue(text)
  commandInput.focus()
}

function handleClearInput() {
  const current = commandInput.getValue()
  if (current.trim()) {
    if (!confirm('Clear input?')) return
  }
  commandInput.clear()
  commandInput.focus()
}

function restoreState() {
  // Reset simulation state
  state.reset()

  // Re-execute active commands
  // Active commands are indices 0 to activeCount-1
  const activeCommands = state.commandHistory.slice(0, state.activeCount)

  activeCommands.forEach(item => {
    if (!item.success) return
    const { commands } = parse(item.text)
    commands.forEach(cmd => executeCommandImmediately(cmd))
  })

  renderer.draw()
}

function startAnimation() {
  if (executionQueue.length === 0) return
  isAnimating = true
  controlPanel.setRunning(true)
  requestAnimationFrame(gameLoop)
}

function stopAnimation() {
  isAnimating = false
  controlPanel.setRunning(false)
}

function executeCommandImmediately(cmd) {
  if (cmd.type === 'COLOR_SET') {
    state.setTrailColor(cmd.color)
  } else if (cmd.type === 'COLOR_UNSET') {
    const current = state.trailColor // Hex #RRGGBBAA
    const dim = current.substring(0, 7) + '00'
    state.setTrailColor(dim)
  } else if (cmd.type === 'ROTATION_SET') {
    state.updateAngle(cmd.resolvedAngle)
  } else if (cmd.type === 'ROTATE') {
    state.updateAngle(state.angle + cmd.resolvedAngle)
  } else if (cmd.type === 'MOVE') {
    cmd.steps.forEach(step => {
      // Apply full move
      moveStepInstant(step.length, step.direction)
    })
  }
}

function getVectorFromDirection(direction, angle) {
  let dx = 0
  let dy = 0
  const diag = 0.7071

  if (direction === 'FORWARD' || direction === 'BACK') {
    const rad = (angle - 90) * (Math.PI / 180)
    dx = Math.cos(rad)
    dy = Math.sin(rad)
    if (direction === 'BACK') {
      dx = -dx
      dy = -dy
    }
    return { dx, dy }
  }

  switch (direction) {
    case Direction.UP: dy = -1; break
    case Direction.DOWN: dy = 1; break
    case Direction.LEFT: dx = -1; break
    case Direction.RIGHT: dx = 1; break
    case Direction.UP_RIGHT: dx = diag; dy = -diag; break
    case Direction.UP_LEFT: dx = -diag; dy = -diag; break
    case Direction.DOWN_RIGHT: dx = diag; dy = diag; break
    case Direction.DOWN_LEFT: dx = -diag; dy = diag; break
  }
  return { dx, dy }
}

function moveStepInstant(length, direction) {
  // Calculate vector
  const { dx, dy } = getVectorFromDirection(direction, state.angle)

  // Convert length (pixels) to normalized coords
  // We need renderer width/height to normalize 'length' pixels
  // Assume width/height from renderer state
  const normDX = (dx * length) / renderer.width
  const normDY = (dy * length) / renderer.height

  let destX = state.dinoPosition.x + normDX
  let destY = state.dinoPosition.y + normDY

  // Add trail segments handling wrap
  state.updateDinoPosition((destX % 1 + 1) % 1, (destY % 1 + 1) % 1)
}

// Animation Variables
let lastTime = 0
let remainingMoveDistance = 0 // in pixels
let currentMoveDirection = null

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = (timestamp - lastTime) / 1000 // seconds
  lastTime = timestamp

  if (!isAnimating) return

  // Process queue
  if (remainingMoveDistance <= 0) {
    // Fetch next command/step
    if (executionQueue.length === 0) {
      stopAnimation()
      lastTime = 0
      return
    }

    const cmd = executionQueue[0]

    if (cmd.type === 'COLOR_SET') {
      state.setTrailColor(cmd.color)
      executionQueue.shift()
    } else if (cmd.type === 'COLOR_UNSET') {
      const current = state.trailColor
      const dim = current.substring(0, 7) + '00'
      state.setTrailColor(dim)
      executionQueue.shift()
    } else if (cmd.type === 'ROTATION_SET') {
      state.updateAngle(cmd.resolvedAngle)
      executionQueue.shift()
    } else if (cmd.type === 'ROTATE') {
      state.updateAngle(state.angle + cmd.resolvedAngle)
      executionQueue.shift()
    } else if (cmd.type === 'MOVE') {
      // Check if we have steps remaining
      if (!cmd._currentStepIndex) cmd._currentStepIndex = 0

      if (cmd._currentStepIndex >= cmd.steps.length) {
        executionQueue.shift()
        requestAnimationFrame(gameLoop)
        return
      }

      const step = cmd.steps[cmd._currentStepIndex]
      remainingMoveDistance = step.length
      currentMoveDirection = step.direction
      cmd._currentStepIndex++
    }
  }

  // Process Movement
  if (remainingMoveDistance > 0) {
    // Speed slider: 1..100 map to e.g. 50px/s .. 1000px/s
    const speedPxPerSec = animationSpeed * 10
    let moveDist = speedPxPerSec * dt

    if (moveDist > remainingMoveDistance) moveDist = remainingMoveDistance

    remainingMoveDistance -= moveDist

    // Apply movement
    applyMove(moveDist, currentMoveDirection)
  }

  renderer.draw()
  requestAnimationFrame(gameLoop)
}

function applyMove(distPx, direction) {
  const { dx, dy } = getVectorFromDirection(direction, state.angle)

  const normDX = (dx * distPx) / renderer.width
  const normDY = (dy * distPx) / renderer.height

  let newX = state.dinoPosition.x + normDX
  let newY = state.dinoPosition.y + normDY

  // Check wrapping
  let wrappedX = newX
  let wrappedY = newY
  let didWrap = false

  if (newX < 0) { wrappedX = 1 + newX; didWrap = true }
  if (newX > 1) { wrappedX = newX - 1; didWrap = true }
  if (newY < 0) { wrappedY = 1 + newY; didWrap = true; }
  if (newY > 1) { wrappedY = newY - 1; didWrap = true; }

  // Add trail segment
  if (!didWrap) {
    // Standard segment
    state.addTrailSegment(state.dinoPosition.x, state.dinoPosition.y, newX, newY, state.trailColor)
  }

  state.updateDinoPosition(wrappedX, wrappedY)
}
