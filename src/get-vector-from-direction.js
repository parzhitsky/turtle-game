import { Direction } from './direction.js'

export function getVectorFromDirection(direction, angle) {
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
