import { state } from './state.js'
import { Config } from './constants.js'

export class Renderer {
  constructor(canvas, dinoElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dino = dinoElement
    this.width = 0
    this.height = 0

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
  }
}
