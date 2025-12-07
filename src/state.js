import { Config } from './constants.js'

class GameState {
  handlers = []

  constructor() {
    this.reset()
  }

  reset() {
    this.dinoPosition = { x: 0.5, y: 0.5 } // Normalized coordinates (0.0 to 1.0)
    this.trailColor = Config.DEFAULT_COLOR
    this.commandHistory = []
    this.trails = [] // Array of {x1, y1, x2, y2, color} (normalized)
    this.isExecuting = false
    this.executionQueue = []
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
    this.commandHistory.unshift({
      text: commandText,
      timestamp: Date.now(),
      success,
    })

    if (this.commandHistory.length > Config.MAX_HISTORY) {
      this.commandHistory.pop()
    }

    this.notifyChange()
  }

  updateDinoPosition(x, y) {
    this.dinoPosition = { x, y }
    // Don't notify on every frame usually, but for now ok
  }

  addTrailSegment(x1, y1, x2, y2, color) {
    this.trails.push({ x1, y1, x2, y2, color })
  }

  setTrailColor(color) {
    this.trailColor = color
  }
}

export const state = new GameState()
