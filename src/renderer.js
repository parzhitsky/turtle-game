import { state } from './state.js'
import { Config } from './constants.js'

export class Renderer {
  constructor(svg, dinoElement) {
    this.svg = svg
    this.dino = dinoElement
    this.trailsGroup = svg.querySelector('#trails-group')
    this.overlayGroup = null
    this.width = 0
    this.height = 0
    this.showDirectionOverlay = false

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(svg.parentElement)

    // Initial resize
    this.resize()
  }

  resize() {
    const parent = this.svg.parentElement
    this.width = parent.clientWidth
    this.height = parent.clientHeight

    this.svg.setAttribute('width', this.width)
    this.svg.setAttribute('height', this.height)
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)

    // Trails stay in DOM, just update dino
    this.updateDinoPosition()
    this.updateOverlay()
  }

  // Convert normalized coords (0-1) to pixels
  toPixels(x, y) {
    return {
      x: x * this.width,
      y: y * this.height,
    }
  }

  addTrailElement(trail) {
    const start = this.toPixels(trail.x1, trail.y1)
    const end = this.toPixels(trail.x2, trail.y2)

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', start.x)
    line.setAttribute('y1', start.y)
    line.setAttribute('x2', end.x)
    line.setAttribute('y2', end.y)
    line.setAttribute('stroke', trail.color)
    line.setAttribute('stroke-width', Config.TRAIL_WIDTH)
    line.setAttribute('stroke-linecap', 'round')

    this.trailsGroup.appendChild(line)
    return line
  }

  clearTrails() {
    while (this.trailsGroup.firstChild) {
      this.trailsGroup.removeChild(this.trailsGroup.firstChild)
    }
  }

  updateDinoPosition() {
    const pos = this.toPixels(state.dinoPosition.x, state.dinoPosition.y)
    this.dino.style.left = `${pos.x}px`
    this.dino.style.top = `${pos.y}px`
  }

  updateOverlay() {
    // Remove old overlay if exists
    if (this.overlayGroup) {
      this.overlayGroup.remove()
      this.overlayGroup = null
    }

    if (!this.showDirectionOverlay) return

    // Create new overlay group
    const center = this.toPixels(state.dinoPosition.x, state.dinoPosition.y)
    const length = 50
    const angleRad = (state.angle - 90) * (Math.PI / 180)
    const dx = Math.cos(angleRad) * length
    const dy = Math.sin(angleRad) * length

    this.overlayGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // Main arrow line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', center.x)
    line.setAttribute('y1', center.y)
    line.setAttribute('x2', center.x + dx)
    line.setAttribute('y2', center.y + dy)
    line.setAttribute('stroke', 'red')
    line.setAttribute('stroke-width', '2')
    this.overlayGroup.appendChild(line)

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
    this.overlayGroup.appendChild(lineLeft)

    const lineRight = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    lineRight.setAttribute('x1', center.x + dx)
    lineRight.setAttribute('y1', center.y + dy)
    lineRight.setAttribute('x2', center.x + dx - Math.cos(angleRight) * headLen)
    lineRight.setAttribute('y2', center.y + dy - Math.sin(angleRight) * headLen)
    lineRight.setAttribute('stroke', 'red')
    lineRight.setAttribute('stroke-width', '2')
    this.overlayGroup.appendChild(lineRight)

    this.svg.appendChild(this.overlayGroup)
  }

  draw() {
    // Trails are already in DOM, just update dino and overlay
    this.updateDinoPosition()
    this.updateOverlay()
  }

  toggleOverlay() {
    this.showDirectionOverlay = !this.showDirectionOverlay
    this.updateOverlay()
  }
}
