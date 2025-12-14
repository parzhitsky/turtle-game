import { resolveInterpolation } from './resolve-interpolation.js'

export function resolveRotationArgs(args, errors) {
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
