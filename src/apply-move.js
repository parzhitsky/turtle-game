import { state } from './state.js'
import { addTrailElement, getHeight, getWidth } from './renderer/renderer.js'
import { getVectorFromDirection } from './get-vector-from-direction.js'

export function applyMove(distPx, direction) {
  const { dx, dy } = getVectorFromDirection(direction, state.angle)

  const normDX = (dx * distPx) / getWidth()
  const normDY = (dy * distPx) / getHeight()

  const newX = state.dinoPosition.x + normDX
  const newY = state.dinoPosition.y + normDY

  // Check wrapping
  let wrappedX = newX
  let wrappedY = newY
  let didWrap = false

  if (newX < 0) { wrappedX = 1 + newX; didWrap = true }
  if (newX > 1) { wrappedX = newX - 1; didWrap = true }
  if (newY < 0) { wrappedY = 1 + newY; didWrap = true }
  if (newY > 1) { wrappedY = newY - 1; didWrap = true }

  // Add trail segment
  if (!didWrap) {
    const trail = { x1: state.dinoPosition.x, y1: state.dinoPosition.y, x2: newX, y2: newY, color: state.trailColor }
    const element = addTrailElement(trail)
    state.addTrailSegment(trail.x1, trail.y1, trail.x2, trail.y2, trail.color, element)
    state.addTrailToCurrentCommand(element)
  }

  state.updateDinoPosition(wrappedX, wrappedY)
}
