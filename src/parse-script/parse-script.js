import { tokenizeLine } from './tokenize-line.js'
import { parseCommand } from './parse-command/parse-command.js'
import { flattenBlock } from './flatten-block.js'

export function parseScript(script) {
  const lines = script.trim().split(/\n+/)
  const errors = []

  // Structure to hold the command tree
  const root = { type: 'BLOCK', repeat: 1, children: [] }
  const stack = [root]

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim()
    const lineNum = index + 1

    if (!trimmed) {
      continue
    }

    const parts = tokenizeLine(trimmed)

    try {
      parseCommand(parts, stack)
    } catch (err) {
      errors.push(`Line ${lineNum}: ${err.message}`)
    }
  }

  // Check for unclosed loops
  if (stack.length > 1) {
    const unclosedCount = stack.length - 1
    errors.push(`Unclosed loops detected (${unclosedCount}).`)
  }

  const commands = flattenBlock(root, errors)

  return {
    commands,
    errors,
  }
}
