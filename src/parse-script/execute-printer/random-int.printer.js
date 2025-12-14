import { Printer } from './printer.abstract.js'
import { random } from './random.js'

export class RandomInt extends Printer {
  execute(args) {
    let max = 2
    let min = 0

    if (args.length >= 1) {
      max = parseFloat(args[0])
    }

    if (args.length >= 2) {
      min = parseFloat(args[1])
    }

    return random(max, min).toString()
  }
}
