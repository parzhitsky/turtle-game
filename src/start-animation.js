import { applyMove } from './apply-move.js'
import { setRunning } from './control-panel.js'
import { draw } from './renderer/renderer.js'
import { state } from './state.js'

// Module-level state for animation
let isAnimating = false
let executionQueue = []
let lastTimestamp = null
let remainingMoveDistance = 0
let currentMoveDirection = null
let animationSpeed = 50

export function setAnimationSpeed(speed) {
  animationSpeed = speed
}

export function startAnimation(commands) {
  executionQueue = [...commands]
  if (executionQueue.length === 0) {
    return
  }

  isAnimating = true
  setRunning(true)
  requestAnimationFrame(runAnimationLoop)
}

function stopAnimation() {
  isAnimating = false
  lastTimestamp = null
  setRunning(false)
}

function runAnimationLoop(timestamp) {
  const dt = (timestamp - (lastTimestamp ?? timestamp)) / 1000

  lastTimestamp = timestamp

  if (!isAnimating) {
    return
  }

  // Process queue
  if (remainingMoveDistance <= 0) {
    if (executionQueue.length === 0) {
      stopAnimation()
      return
    }

    const command = executionQueue[0]

    if (command.type === 'COLOR_SET') {
      state.setTrailColor(command.color)
      executionQueue.shift()
    } else if (command.type === 'COLOR_UNSET') {
      state.setTrailColor(state.trailColor.substring(0, 7) + '00')
      executionQueue.shift()
    } else if (command.type === 'ROTATION_SET') {
      state.updateAngle(command.resolvedAngle)
      executionQueue.shift()
    } else if (command.type === 'ROTATE') {
      state.updateAngle(state.angle + command.resolvedAngle)
      executionQueue.shift()
    } else if (command.type === 'MOVE') {
      command._currentStepIndex ??= 0

      if (command._currentStepIndex >= command.steps.length) {
        executionQueue.shift()
        requestAnimationFrame(runAnimationLoop)
        return
      }

      const step = command.steps[command._currentStepIndex]
      remainingMoveDistance = step.length
      currentMoveDirection = step.direction
      command._currentStepIndex++
    }
  }

  // Process Movement
  if (remainingMoveDistance > 0) {
    let moveDist = animationSpeed * 10 * dt

    if (moveDist > remainingMoveDistance) {
      moveDist = remainingMoveDistance
    }

    remainingMoveDistance -= moveDist

    applyMove(moveDist, currentMoveDirection)
  }

  draw()
  requestAnimationFrame(runAnimationLoop)
}
