export function isPotentialInterpolation(input) {
  return typeof input === 'string' && input.startsWith('{') && input.endsWith('}')
}
