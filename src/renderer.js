import { state } from './state.js'
import { Config } from './constants.js'

export class Renderer {
  constructor(canvas, dinoElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dino = dinoElement
    this.width = 0
    this.height = 0
    this.showDirectionOverlay = false

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas.parentElement)

    // Initial resize
    this.resize()
  }

  resize() {
    const parent = this.canvas.parentElement
    this.width = parent.clientWidth
    this.height = parent.clientHeight

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = this.width * dpr
    this.canvas.height = this.height * dpr
    this.ctx.scale(dpr, dpr)

    // Re-draw immediately
    this.draw()
  }

  // Convert normalized coords (0-1) to pixels
  toPixels(x, y) {
    return {
      x: x * this.width,
      y: y * this.height,
    }
  }

  draw() {
    // Clear screen
    this.ctx.clearRect(0, 0, this.width, this.height)

    // Draw trails
    state.trails.forEach(trail => {
      const start = this.toPixels(trail.x1, trail.y1)
      const end = this.toPixels(trail.x2, trail.y2)

      this.ctx.beginPath()
      this.ctx.moveTo(start.x, start.y)
      this.ctx.lineTo(end.x, end.y)
      this.ctx.strokeStyle = trail.color
      this.ctx.lineWidth = Config.TRAIL_WIDTH
      this.ctx.lineCap = 'round'
      this.ctx.stroke()
    })

    // Update Dino Position (DOM)
    const dinoPos = this.toPixels(state.dinoPosition.x, state.dinoPosition.y)
    this.dino.style.left = `${dinoPos.x}px`
    this.dino.style.top = `${dinoPos.y}px`

    // Overlay
    if (this.showDirectionOverlay) {
      this.drawOverlay(dinoPos)
    }
  }

  drawOverlay(center) {
    const length = 50
    const angleRad = (state.angle - 90) * (Math.PI / 180)
    const dx = Math.cos(angleRad) * length
    const dy = Math.sin(angleRad) * length

    this.ctx.beginPath()
    this.ctx.moveTo(center.x, center.y)
    this.ctx.lineTo(center.x + dx, center.y + dy)
    this.ctx.strokeStyle = 'red'
    this.ctx.lineWidth = 2
    this.ctx.stroke()

    // Arrowhead
    const headLen = 10
    const angleLeft = angleRad - Math.PI / 6
    const angleRight = angleRad + Math.PI / 6

    this.ctx.beginPath()
    this.ctx.moveTo(center.x + dx, center.y + dy)
    this.ctx.lineTo(center.x + dx - Math.cos(angleLeft) * headLen, center.y + dy - Math.sin(angleLeft) * headLen)
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.moveTo(center.x + dx, center.y + dy)
    this.ctx.lineTo(center.x + dx - Math.cos(angleRight) * headLen, center.y + dy - Math.sin(angleRight) * headLen)
    this.ctx.stroke()
  }

  toggleOverlay() {
    this.showDirectionOverlay = !this.showDirectionOverlay
    this.draw()
  }
}
