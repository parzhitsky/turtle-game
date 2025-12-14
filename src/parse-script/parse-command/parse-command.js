import { ColorSet } from './color-set.command-parser.js'
import { ColorUnset } from './color-unset.command-parser.js'
import { Move } from './move.command-parser.js'
import { Repeat } from './repeat.command-parser.js'
import { Rotation } from './rotation.command-parser.js'

const rotation = new Rotation()
const parsers = {
  COLOR_SET: new ColorSet(),
  COLOR_UNSET: new ColorUnset(),
  MOVE: new Move(),
  REPEAT_TIMES: new Repeat(),
  ROTATION_SET: rotation,
  ROTATE: rotation,
}

export function parseCommand(parts, stack) {
  const cmd = parts[0]

  if (!(cmd in parsers)) {
    throw new Error(`Unknown command '${cmd}'.`)
  }

  parsers[cmd].parse(parts, stack)
}
