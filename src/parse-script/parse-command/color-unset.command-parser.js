import { CommandParser } from './command-parser.abstract.js'

export class ColorUnset extends CommandParser {
  parse(parts, stack) {
    stack[stack.length - 1].children.push({ type: 'COLOR_UNSET' })
  }
}
