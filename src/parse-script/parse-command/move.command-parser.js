import { CommandParser } from './command-parser.abstract.js'
import { isPotentialInterpolation } from './is-potential-interpolation.js'

export const Direction = {
  UP: 'UP',
  UP_RIGHT: 'UP_RIGHT',
  RIGHT: 'RIGHT',
  DOWN_RIGHT: 'DOWN_RIGHT',
  DOWN: 'DOWN',
  DOWN_LEFT: 'DOWN_LEFT',
  LEFT: 'LEFT',
  UP_LEFT: 'UP_LEFT',
  FORWARD: 'FORWARD',
  BACK: 'BACK'
}

export class Move extends CommandParser {
  parse(parts, stack) {
    if (parts.length < 3 || (parts.length - 1) % 2 !== 0) {
      throw new Error('Invalid MOVE usage. Expected pairs of Length and Direction.')
    }

    const steps = []

    for (let i = 1; i < parts.length; i += 2) {
      const lengthStr = parts[i]
      const direction = parts[i + 1]

      let length = lengthStr

      if (!isPotentialInterpolation(lengthStr)) {
        length = parseFloat(lengthStr)
        if (isNaN(length)) {
          throw new Error(`Invalid length '${lengthStr}'. Must be a number.`)
        }
      }

      if (!Direction[direction]) {
        throw new Error(`Unknown direction '${direction}'.`)
      }

      steps.push({ length, direction })
    }

    stack[stack.length - 1].children.push({ type: 'MOVE', steps })
  }
}
