import { applyMove } from './apply-move.js'
import { setRunning } from './control-panel.js'
import { draw } from './renderer/renderer.js'
import { state } from './state.js'

// Module-level state for animation
let isAnimating = false
let executionQueue = []
let lastTime = 0
let remainingMoveDistance = 0
let currentMoveDirection = null
let animationSpeed = 50

export function setAnimationSpeed(speed) {
  animationSpeed = speed
}

export function startAnimation(commands) {
  executionQueue = [...commands]
  if (executionQueue.length === 0) return

  isAnimating = true
  setRunning(true)
  requestAnimationFrame(runAnimationLoop)
}

function stopAnimation() {
  isAnimating = false
  setRunning(false)
}

function runAnimationLoop(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = (timestamp - lastTime) / 1000
  lastTime = timestamp

  if (!isAnimating) return

  // Process queue
  if (remainingMoveDistance <= 0) {
    if (executionQueue.length === 0) {
      stopAnimation()
      lastTime = 0
      return
    }

    const cmd = executionQueue[0]

    let shifted = false
    if (cmd.type === 'COLOR_SET') {
      state.setTrailColor(cmd.color)
      executionQueue.shift()
      shifted = true
    } else if (cmd.type === 'COLOR_UNSET') {
      const current = state.trailColor
      const dim = current.substring(0, 7) + '00'
      state.setTrailColor(dim)
      executionQueue.shift()
      shifted = true
    } else if (cmd.type === 'ROTATION_SET') {
      state.updateAngle(cmd.resolvedAngle)
      executionQueue.shift()
      shifted = true
    } else if (cmd.type === 'ROTATE') {
      state.updateAngle(state.angle + cmd.resolvedAngle)
      executionQueue.shift()
      shifted = true
    } else if (cmd.type === 'MOVE') {
      if (!cmd._currentStepIndex) cmd._currentStepIndex = 0

      if (cmd._currentStepIndex >= cmd.steps.length) {
        executionQueue.shift()
        requestAnimationFrame(runAnimationLoop)
        return
      }

      const step = cmd.steps[cmd._currentStepIndex]
      remainingMoveDistance = step.length
      currentMoveDirection = step.direction
      cmd._currentStepIndex++
    }

    // Immediately process next command if we just finished a non-move command
    // (To avoid one frame delay) - logic preserved from original imply?
    // Original code processed logic then returned or continued.
    // If I shifted, I should loop again?
    // Original used recursive call or next frame?
    // Original: shift, then flow falls through to next checks.
    // But `executionQueue` changed.
    // The original code `if (remainingMoveDistance <= 0) { ... checks ... }`
    // If it shifted a command, it didn't immediately process the next one in the SAME frame (it falls through to `if (remainingMoveDistance > 0)` which is false).
    // So usually one command per frame if instant.
    // I'll keep it simple as is.
  }

  // Process Movement
  if (remainingMoveDistance > 0) {
    const speedPxPerSec = animationSpeed * 10
    let moveDist = speedPxPerSec * dt

    if (moveDist > remainingMoveDistance) moveDist = remainingMoveDistance

    remainingMoveDistance -= moveDist

    applyMove(moveDist, currentMoveDirection)
  }

  draw()
  requestAnimationFrame(runAnimationLoop)
}
