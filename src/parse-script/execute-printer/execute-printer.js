import { Hex } from './hex.printer.js'
import { Print } from './print.printer.js'
import { RandomHex } from './random-hex.printer.js'
import { RandomInt } from './random-int.printer.js'

const printers = {
  PRINT: new Print(),
  RANDOM_INT: new RandomInt(),
  HEX: new Hex(),
  RANDOM_HEX: new RandomHex(),
}

export function executePrinter(content) {
  const [printerName, ...args] = content.trim().split(/\s+/)

  if (!(printerName in printers)) {
    throw new Error(`Unknown printer '${printerName}'`)
  }

  return printers[printerName].execute(args)
}
