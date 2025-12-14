import { resolveInterpolation } from './resolve-interpolation.js'
import { resolveRotationArgs } from './resolve-rotation.js'

const hexColorPattern = /^#[0-9A-Fa-f]{8}$/i

// TODO: split into multiple small private functions (within this file)
export function flattenBlock(block, errors = []) {
  const result = []

  // Stack to track blocks to process: { block, iterationNumber }
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
