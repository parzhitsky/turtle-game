import { Printer } from './printer.abstract.js'
import { random } from './random.js'

function toHex(n) {
  return n.toString(16).padStart(2, '0').toUpperCase()
}

export class RandomHex extends Printer {
  execute(args) {
    let arg

    if (args.length >= 1) {
      arg = parseInt(args[0])
    }

    const r = random()
    const g = random()
    const b = random()
    const a = (arg !== undefined) ? Math.max(0, Math.min(255, arg)) : random()

    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`
  }
}
