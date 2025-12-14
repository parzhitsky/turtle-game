export function createOverlayGroup(center, angle) {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const length = 50
  const angleRad = (angle - 90) * (Math.PI / 180)
  const dx = Math.cos(angleRad) * length
  const dy = Math.sin(angleRad) * length

  // Main arrow line
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line.setAttribute('x1', center.x)
  line.setAttribute('y1', center.y)
  line.setAttribute('x2', center.x + dx)
  line.setAttribute('y2', center.y + dy)
  line.setAttribute('stroke', 'red')
  line.setAttribute('stroke-width', '2')
  group.appendChild(line)

  // Arrowhead lines
  const headLen = 10
  const angleLeft = angleRad - Math.PI / 6
  const angleRight = angleRad + Math.PI / 6

  const lineLeft = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  lineLeft.setAttribute('x1', center.x + dx)
  lineLeft.setAttribute('y1', center.y + dy)
  lineLeft.setAttribute('x2', center.x + dx - Math.cos(angleLeft) * headLen)
  lineLeft.setAttribute('y2', center.y + dy - Math.sin(angleLeft) * headLen)
  lineLeft.setAttribute('stroke', 'red')
  lineLeft.setAttribute('stroke-width', '2')
  group.appendChild(lineLeft)

  const lineRight = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  lineRight.setAttribute('x1', center.x + dx)
  lineRight.setAttribute('y1', center.y + dy)
  lineRight.setAttribute('x2', center.x + dx - Math.cos(angleRight) * headLen)
  lineRight.setAttribute('y2', center.y + dy - Math.sin(angleRight) * headLen)
  lineRight.setAttribute('stroke', 'red')
  lineRight.setAttribute('stroke-width', '2')
  group.appendChild(lineRight)

  return group
}
