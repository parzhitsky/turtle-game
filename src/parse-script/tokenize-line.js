export function tokenizeLine(line) {
  const parts = []
  let current = ''
  let braceDepth = 0

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

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

  return parts
}
