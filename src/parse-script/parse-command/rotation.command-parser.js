import { CommandParser } from './command-parser.abstract.js'
import { isPotentialInterpolation } from './is-potential-interpolation.js'

export class Rotation extends CommandParser {
  parse(parts, stack) {
    const cmd = parts[0]
    const args = []
    let currentIdx = 1

    while (currentIdx < parts.length && args.length < 3) {
      const arg = parts[currentIdx]
      if (isPotentialInterpolation(arg)) {
        args.push(arg)
      } else {
        const val = parseFloat(arg)
        if (!Number.isInteger(val)) {
          throw new Error(`Invalid argument '${arg}' for ${cmd}. Must be an integer.`)
        }
        args.push(val)
      }
      currentIdx++
    }

    if (args.length === 0) {
      throw new Error(`${cmd} requires at least 1 argument (degrees).`)
    }

    if (parts.length > currentIdx) {
      throw new Error(`${cmd} accepts at most 3 arguments.`)
    }

    stack[stack.length - 1].children.push({ type: cmd, args })
  }
}
