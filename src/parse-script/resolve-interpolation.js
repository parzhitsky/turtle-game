import { executePrinter } from './execute-printer/execute-printer.js'

export function resolveInterpolation(text) {
  if (typeof text !== 'string' || !text.startsWith('{') || !text.endsWith('}')) {
    return text
  }

  // Remove outer brackets
  let content = text.slice(1, -1).trim()

  while (content.includes('{')) {
    const end = content.indexOf('}')

    if (end === -1) {
      throw new Error(`Mismatched brackets in interpolation '${text}'.`)
    }

    const start = content.lastIndexOf('{', end)

    if (start === -1) {
      throw new Error(`Mismatched brackets in interpolation '${text}'.`)
    }

    const inner = content.substring(start, end + 1)
    const innerContent = inner.slice(1, -1).trim()
    const resolvedInner = executePrinter(innerContent)

    content = content.substring(0, start) + resolvedInner + content.substring(end + 1)
  }

  return executePrinter(content)
}
