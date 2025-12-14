import { CommandParser } from './command-parser.abstract.js'
import { isPotentialInterpolation } from './is-potential-interpolation.js'

const hexColorPattern = /^#[0-9A-Fa-f]{8}$/i

export class ColorSet extends CommandParser {
  parse(parts, stack) {
    if (parts.length !== 2) {
      throw new Error('Invalid COLOR_SET usage. Expected 1 argument.')
    }

    const color = parts[1]

    if (!isPotentialInterpolation(color) && !hexColorPattern.test(color)) {
      throw new Error('Invalid hex color format. Use #RRGGBBAA.')
    }

    stack[stack.length - 1].children.push({ type: 'COLOR_SET', color })
  }
}
