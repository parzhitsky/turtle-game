import { Config } from './constants.js'

class State {
  handlers = []

  constructor() {
    this.commandHistory = []
    this.activeCount = 0
    this.reset()
  }

  reset() {
    this.dinoPosition = { x: 0.5, y: 0.5 } // Normalized coordinates (0.0 to 1.0)
    this.trailColor = Config.DEFAULT_COLOR
    // this.commandHistory = [] // History is persistent across internal resets
    this.trails = [] // Array of {x1, y1, x2, y2, color} (normalized)
    this.isExecuting = false
    this.executionQueue = []
    this.angle = 0 // Degrees, 0 is UP, Clockwise
    this.notifyChange()
  }

  // Observer pattern to update UI
  subscribe(handler) {
    this.handlers.push(handler)
  }

  notifyChange() {
    for (const handler of this.handlers) {
      handler(this)
    }
  }

  addCommandToHistory(commandText, success = true) {
    // If we represent a "new branch" of history (activeCount < length),
    // we must discard the future commands.
    if (this.activeCount < this.commandHistory.length) {
      // Keep indices 0 to activeCount-1
      this.commandHistory.length = this.activeCount
    }

    this.commandHistory.push({
      text: commandText,
      timestamp: Date.now(),
      success,
    })

    this.activeCount = this.commandHistory.length

    if (this.commandHistory.length > Config.MAX_HISTORY) {
      this.commandHistory.shift() // Remove oldest (index 0)
      this.activeCount--
    }

    this.notifyChange()
  }

  setActiveCount(count) {
    this.activeCount = count
    this.notifyChange()
  }

  updateDinoPosition(x, y) {
    this.dinoPosition = { x, y }
  }

  updateAngle(angle) {
    this.angle = angle
  }

  addTrailSegment(x1, y1, x2, y2, color) {
    this.trails.push({ x1, y1, x2, y2, color })
  }

  setTrailColor(color) {
    this.trailColor = color
  }
}

export const state = new State()
