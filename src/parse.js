import { Direction } from './constants.js'

const hexColorPattern = /^#[0-9A-Fa-f]{8}$/i

export function parse(input) {
  const lines = input.trim().split(/\n+/)
  const errors = []

  // Helper to check if string might be an interpolation
  const isPotentialInterpolation = (str) => typeof str === 'string' && str.startsWith('{') && str.endsWith('}')

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

    // Tokenize line, respecting nested braces
    const parts = []
    let current = ''
    let braceDepth = 0

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i]

      if (char === '{') {
        braceDepth++
        current += char
      } else if (char === '}') {
        braceDepth--
        current += char
      } else if (/\s/.test(char) && braceDepth === 0) {
        if (current) {
          parts.push(current)
          current = ''
        }
      } else {
        current += char
      }
    }
    if (current) {
      parts.push(current)
    }

    const cmd = parts[0]

    try {
      if (cmd === 'COLOR_SET') {
        if (parts.length !== 2) {
          throw new Error(`Invalid COLOR_SET usage. Expected 1 argument.`)
        }

        const color = parts[1]

        // Basic hex validation - deferred if interpolation
        if (!isPotentialInterpolation(color) && !hexColorPattern.test(color)) {
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
          const lengthStr = parts[i]
          const direction = parts[i + 1]

          let length = lengthStr
          // Only validate if NOT interpolation
          if (!isPotentialInterpolation(lengthStr)) {
            length = parseFloat(lengthStr)
            if (isNaN(length)) {
              throw new Error(`Invalid length '${lengthStr}'. Must be a number.`)
            }
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
          let amount = arg1

          if (!isPotentialInterpolation(arg1)) {
            amount = parseFloat(arg1)
            // Check if it's a valid integer >= 0
            if (!Number.isInteger(amount) || amount < 0) {
              throw new Error(`Invalid repeat amount '${arg1}'. Must be a non-negative integer.`)
            }
          }

          const newBlock = { type: 'BLOCK', repeat: amount, children: [] }
          getCurrentBlock(stack).children.push(newBlock)
          stack.push(newBlock)
        }

      } else if (cmd === 'ROTATION_SET' || cmd === 'ROTATE') {
        const args = []
        let currentIdx = 1

        // Parse up to 3 arguments
        while (currentIdx < parts.length && args.length < 3) {
          const arg = parts[currentIdx]
          // If interpolation, we can't validate yet
          if (isPotentialInterpolation(arg)) {
            args.push(arg)
          } else {
            const val = parseFloat(arg)
            if (!Number.isInteger(val)) {
              throw new Error(`Invalid argument '${arg}' for ${cmd}. Must be an integer.`)
            }
            args.push(val)
          }
          currentIdx++
        }

        if (args.length === 0) {
          throw new Error(`${cmd} requires at least 1 argument (degrees).`)
        }

        if (parts.length > currentIdx) {
          throw new Error(`${cmd} accepts at most 3 arguments.`)
        }

        getCurrentBlock(stack).children.push({ type: cmd, args })

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

  const commands = flattenBlock(root, errors)

  return {
    commands,
    errors,
  }
}

function getCurrentBlock(stack) {
  return stack[stack.length - 1]
}


function flattenBlock(block, errors = []) {
  const result = []

  // Stack to track blocks to process: { block, iterationNumber }
  // We'll process blocks depth-first to maintain proper command order
  const stack = []

  // Resolve the root block's repeat count first
  let rootRepeatCount = block.repeat
  if (typeof rootRepeatCount === 'string') {
    try {
      const resolved = resolveInterpolation(rootRepeatCount)
      rootRepeatCount = parseFloat(resolved)
      if (!Number.isInteger(rootRepeatCount) || rootRepeatCount < 0) {
        errors.push(`Invalid resolved repeat amount '${resolved}'. Must be a non-negative integer.`)
        return []
      }
    } catch (err) {
      errors.push(`Error resolving repeat amount: ${err.message}`)
      return []
    }
  }

  // Initialize stack with root block iterations (in reverse order for correct processing)
  for (let i = rootRepeatCount - 1; i >= 0; i--) {
    stack.push({ block, iterationNumber: i })
  }

  // Process stack iteratively
  while (stack.length > 0) {
    const { block: currentBlock, iterationNumber } = stack.pop()

    // Process this block's children for this specific iteration
    // We need to process children in reverse order since we're using a stack
    for (let childIdx = currentBlock.children.length - 1; childIdx >= 0; childIdx--) {
      const child = currentBlock.children[childIdx]

      try {
        if (child.type === 'BLOCK') {
          // Resolve the child block's repeat count
          let childRepeatCount = child.repeat

          if (typeof childRepeatCount === 'string') {
            try {
              const resolved = resolveInterpolation(childRepeatCount)
              childRepeatCount = parseFloat(resolved)
              if (!Number.isInteger(childRepeatCount) || childRepeatCount < 0) {
                errors.push(`Invalid resolved repeat amount '${resolved}'. Must be a non-negative integer.`)
                continue
              }
            } catch (err) {
              errors.push(`Error resolving repeat amount: ${err.message}`)
              continue
            }
          }

          // Push child block iterations onto stack (in reverse order)
          for (let i = childRepeatCount - 1; i >= 0; i--) {
            stack.push({ block: child, iterationNumber: i })
          }
        } else {
          // It's a command - clone and resolve it
          const cmd = JSON.parse(JSON.stringify(child))

          // Resolve arguments for this command
          if (cmd.type === 'COLOR_SET') {
            if (typeof cmd.color === 'string' && cmd.color.startsWith('{')) {
              cmd.color = resolveInterpolation(cmd.color)
              if (!hexColorPattern.test(cmd.color)) {
                throw new Error(`Invalid resolved hex color '${cmd.color}'. Use #RRGGBBAA.`)
              }
            }
          } else if (cmd.type === 'MOVE') {
            for (const step of cmd.steps) {
              if (typeof step.length === 'string') {
                const resolved = resolveInterpolation(step.length)
                const val = parseFloat(resolved)
                if (isNaN(val)) {
                  throw new Error(`Invalid resolved length '${resolved}'.`)
                }
                step.length = val
              }
            }
          } else if (cmd.type === 'ROTATION_SET' || cmd.type === 'ROTATE') {
            const angle = resolveRotationArgs(cmd.args, errors)
            if (angle !== null) {
              cmd.resolvedAngle = angle
              // Since we're processing in reverse, prepend to result
              result.unshift(cmd)
            }
            continue
          }

          // Since we're processing in reverse order, prepend to result
          result.unshift(cmd)
        }
      } catch (err) {
        errors.push(`Runtime error: ${err.message}`)
      }
    }
  }

  return result
}

function resolveRotationArgs(args, errors) {
  const numericArgs = []
  for (const arg of args) {
    let val = arg
    if (typeof arg === 'string' && arg.startsWith('{')) {
      try {
        const resolved = resolveInterpolation(arg)
        val = parseFloat(resolved)
        if (!Number.isInteger(val)) {
          errors.push(`Invalid resolved argument '${resolved}'. Must be an integer.`)
          return null
        }
      } catch (err) {
        errors.push(`Error resolving argument: ${err.message}`)
        return null
      }
    }
    numericArgs.push(val)
  }

  // Calculate total degrees
  let degrees = numericArgs[0]
  if (numericArgs.length > 1) degrees += numericArgs[1] / 60
  if (numericArgs.length > 2) degrees += numericArgs[2] / 3600

  return degrees
}

function resolveInterpolation(text) {
  if (typeof text !== 'string' || !text.startsWith('{') || !text.endsWith('}')) {
    return text
  }

  // Remove outer brackets
  let content = text.slice(1, -1).trim()

  // Find nested interpolations: {...}
  // Process innermost first by finding the first closing bracket
  // and its matching opening bracket before it.

  while (content.includes('{')) {
    const end = content.indexOf('}')
    if (end === -1) {
      throw new Error(`Mismatched brackets in interpolation '${text}'.`)
    }

    const start = content.lastIndexOf('{', end)
    if (start === -1) {
      // Should be impossible if we found } and check includes {
      throw new Error(`Mismatched brackets in interpolation '${text}'.`)
    }

    // Extract innermost pair: { ... }
    const inner = content.substring(start, end + 1)
    // Strip the braces and execute the printer command
    const innerContent = inner.slice(1, -1).trim()
    const resolvedInner = executePrinter(innerContent)

    content = content.substring(0, start) + resolvedInner + content.substring(end + 1)
  }

  // Now content is flat "CMD arg1 arg2 ..."
  return executePrinter(content)
}

function executePrinter(content) {
  const parts = content.trim().split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  if (cmd === 'PRINT') {
    // Reconstruct the string from args (lossy with whitespace but acceptable per spec "any text, including spaces")
    // Actually spec says "text, including spaces". split(/\s+/) destroys spaces.
    // Better: remove "PRINT" from start and trim.
    return content.replace(/^PRINT\s*/, '') // Keeps spaces after PRINT?
    // "PRINT <any text>" -> replaces PRINT with nothing.
    // Example: "PRINT  100 " -> " 100 " -> parsed as 100 later.
    // "PRINT 100" -> "100"

  } else if (cmd === 'RANDOM_INT') {
    // RANDOM_INT <max=2> <min=0>
    let max = 2
    let min = 0

    if (args.length >= 1) max = parseFloat(args[0])
    if (args.length >= 2) min = parseFloat(args[1])

    // Spec: max (exclusively), min (inclusively)
    // Return random integer.
    return Math.floor(Math.random() * (max - min) + min).toString()

  } else if (cmd === 'HEX') {
    // HEX <R> <G> <B> <A=255>
    if (args.length < 3) throw new Error(`HEX requires at least 3 arguments (R, G, B).`)
    const r = parseInt(args[0])
    const g = parseInt(args[1])
    const b = parseInt(args[2])
    const a = args.length > 3 ? parseInt(args[3]) : 255

    const toHex = (n) => {
      const clamped = Math.max(0, Math.min(255, n))
      return clamped.toString(16).padStart(2, '0').toUpperCase()
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`

  } else if (cmd === 'RANDOM_HEX') {
    // RANDOM_HEX <A>
    let a
    if (args.length >= 1) {
      a = parseInt(args[0])
    }

    const rand = () => Math.floor(Math.random() * 256)
    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase()

    const r = rand(), g = rand(), b = rand()
    const finalA = (a !== undefined) ? Math.max(0, Math.min(255, a)) : rand()

    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(finalA)}`
  }

  throw new Error(`Unknown printer '${cmd}'`)
}
