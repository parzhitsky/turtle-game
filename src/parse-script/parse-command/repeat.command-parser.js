import { CommandParser } from './command-parser.abstract.js'
import { isPotentialInterpolation } from './is-potential-interpolation.js'

export class Repeat extends CommandParser {
  parse(parts, stack) {
    if (parts.length > 2) {
      throw new Error('Invalid REPEAT_TIMES usage. Too many arguments.')
    }

    if (parts.length < 2) {
      throw new Error('Invalid REPEAT_TIMES usage. Expected amount or DONE.')
    }

    const arg1 = parts[1]

    if (arg1 === 'DONE') {
      if (stack.length <= 1) {
        throw new Error('Unexpected REPEAT_TIMES DONE. No loop to close.')
      }
      stack.pop()
      return
    }

    let amount = arg1

    if (!isPotentialInterpolation(arg1)) {
      amount = parseFloat(arg1)
      if (!Number.isInteger(amount) || amount < 0) {
        throw new Error(`Invalid repeat amount '${arg1}'. Must be a non-negative integer.`)
      }
    }

    const newBlock = { type: 'BLOCK', repeat: amount, children: [] }
    stack[stack.length - 1].children.push(newBlock)
    stack.push(newBlock)
  }
}
