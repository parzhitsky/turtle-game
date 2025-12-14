import { Direction } from './parse-script/parse-command/move.command-parser.js'

export function getVectorFromDirection(direction, angle) {
  let dx = 0
  let dy = 0
  const diag = 0.7071

  if (direction === Direction.FORWARD || direction === Direction.BACK) {
    const rad = (angle - 90) * (Math.PI / 180)
    dx = Math.cos(rad)
    dy = Math.sin(rad)
    if (direction === Direction.BACK) {
      dx = -dx
      dy = -dy
    }
    return { dx, dy }
  }

  switch (direction) {
    case Direction.UP:
      dy = -1
      break

    case Direction.DOWN:
      dy = 1
      break

    case Direction.LEFT:
      dx = -1
      break

    case Direction.RIGHT:
      dx = 1
      break

    case Direction.UP_RIGHT:
      dx = diag
      dy = -diag
      break

    case Direction.UP_LEFT:
      dx = -diag
      dy = -diag
      break

    case Direction.DOWN_RIGHT:
      dx = diag
      dy = diag
      break

    case Direction.DOWN_LEFT:
      dx = -diag
      dy = diag
      break
  }

  return { dx, dy }
}
