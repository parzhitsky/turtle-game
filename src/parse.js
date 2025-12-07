import { Direction } from './constants.js'

const hexColorPattern = /^#[0-9A-Fa-f]{8}$/i

export function parse(input) {
  const lines = input.trim().split(/\n+/)
  const errors = []

  // Structure to hold the command tree
  // Root is a block with repeat=1
  const root = { type: 'BLOCK', repeat: 1, children: [] }
  const stack = [root]

  for (const [index, line] of lines.entries()) {
    const trimmed = line.trim()
    const lineNum = index + 1

    if (!trimmed) {
      continue
    }

    const parts = trimmed.split(/\s+/)
    const cmd = parts[0]

    try {
      if (cmd === 'COLOR_SET') {
        if (parts.length !== 2) {
          throw new Error(`Invalid COLOR_SET usage. Expected 1 argument.`)
        }

        const color = parts[1]

        // Basic hex validation
        if (!hexColorPattern.test(color)) {
          throw new Error(`Invalid hex color format. Use #RRGGBBAA.`)
        }

        getCurrentBlock(stack).children.push({ type: 'COLOR_SET', color })
      } else if (cmd === 'COLOR_UNSET') {
        getCurrentBlock(stack).children.push({ type: 'COLOR_UNSET' })
      } else if (cmd === 'MOVE') {
        if (parts.length < 3 || (parts.length - 1) % 2 !== 0) {
          throw new Error(`Invalid MOVE usage. Expected pairs of Length and Direction.`)
        }

        const steps = []

        for (let i = 1; i < parts.length; i += 2) {
          const length = parseFloat(parts[i])
          const direction = parts[i + 1]

          if (isNaN(length)) {
            throw new Error(`Invalid length '${parts[i]}'. Must be a number.`)
          }

          if (!Direction[direction]) {
            throw new Error(`Unknown direction '${direction}'.`)
          }

          steps.push({ length, direction })
        }

        getCurrentBlock(stack).children.push({ type: 'MOVE', steps })
      } else if (cmd === 'REPEAT_TIMES') {
        // Syntax: REPEAT_TIMES <amount>
        // OR: REPEAT_TIMES DONE

        if (parts.length > 2) {
          throw new Error(`Invalid REPEAT_TIMES usage. Too many arguments.`)
        }

        if (parts.length < 2) {
          throw new Error(`Invalid REPEAT_TIMES usage. Expected amount or DONE.`)
        }

        const arg1 = parts[1]

        if (arg1 === 'DONE') {
          // Case: Loop End
          if (stack.length <= 1) {
            throw new Error(`Unexpected REPEAT_TIMES DONE. No loop to close.`)
          }

          stack.pop() // Close loop

        } else {
          // Case: Loop Start
          // REPEAT_TIMES <amount>

          // Parse Amount
          // "natural number (starting with 0)"
          const amount = parseFloat(arg1)
          // Check if it's a valid integer >= 0
          if (!Number.isInteger(amount) || amount < 0) {
            throw new Error(`Invalid repeat amount '${arg1}'. Must be a non-negative integer.`)
          }

          const newBlock = { type: 'BLOCK', repeat: amount, children: [] }
          getCurrentBlock(stack).children.push(newBlock)
          stack.push(newBlock)
        }

      } else {
        throw new Error(`Unknown command '${cmd}'.`)
      }
    } catch (err) {
      errors.push(`Line ${lineNum}: ${err.message}`)
    }
  }

  // Check for unclosed loops
  if (stack.length > 1) {
    const unclosedCount = stack.length - 1
    errors.push(`Unclosed loops detected (${unclosedCount}).`)
  }

  const commands = flattenBlock(root)

  return {
    commands,
    errors,
  }
}

function getCurrentBlock(stack) {
  return stack[stack.length - 1]
}

function flattenBlock(block) {
  const result = []
  for (let i = 0; i < block.repeat; i++) {
    for (const child of block.children) {
      if (child.type === 'BLOCK') {
        result.push(...flattenBlock(child))
      } else {
        // Deep clone to ensure command instances are unique in the execution queue
        result.push(JSON.parse(JSON.stringify(child)))
      }
    }
  }
  return result
}
