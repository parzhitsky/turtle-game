import { Printer } from './printer.abstract.js'

function toHex(n) {
  return Math.max(0, Math.min(0xFF, n)).toString(16).padStart(2, '0').toUpperCase()
}

export class Hex extends Printer {
  execute(args) {
    if (args.length < 3) {
      throw new Error('HEX requires at least 3 arguments (R, G, B).')
    }

    const r = parseInt(args[0])
    const g = parseInt(args[1])
    const b = parseInt(args[2])
    const a = args.length > 3 ? parseInt(args[3]) : 0xFF

    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`
  }
}
