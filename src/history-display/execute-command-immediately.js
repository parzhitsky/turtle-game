import { state } from '../state.js'
import { moveStepInstant } from '../move-step-instant.js'

export function executeCommandImmediately(cmd) {
  if (cmd.type === 'COLOR_SET') {
    state.setTrailColor(cmd.color)
  } else if (cmd.type === 'COLOR_UNSET') {
    state.setTrailColor(state.trailColor.substring(0, 7) + '00')
  } else if (cmd.type === 'ROTATION_SET') {
    state.updateAngle(cmd.resolvedAngle)
  } else if (cmd.type === 'ROTATE') {
    state.updateAngle(state.angle + cmd.resolvedAngle)
  } else if (cmd.type === 'MOVE') {
    for (const step of cmd.steps) {
      moveStepInstant(step.length, step.direction)
    }
  }
}
