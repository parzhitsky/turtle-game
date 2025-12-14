import { getVectorFromDirection } from './get-vector-from-direction.js'
import { getHeight, getWidth } from './renderer/renderer.js'
import { state } from './state.js'

export function moveStepInstant(length, direction) {
  // Calculate vector
  const { dx, dy } = getVectorFromDirection(direction, state.angle)

  // Convert length (pixels) to normalized coords
  const normDX = (dx * length) / getWidth()
  const normDY = (dy * length) / getHeight()

  const destX = state.dinoPosition.x + normDX
  const destY = state.dinoPosition.y + normDY

  // Update position with wrapping
  state.updateDinoPosition((destX % 1 + 1) % 1, (destY % 1 + 1) % 1)
}
