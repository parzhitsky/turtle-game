const DEFAULT_COLOR = '#00ff88ff'
const MAX_HISTORY = 100

class State {
  handlers = []
  commandHistory = []
  activeCount = 0

  dinoPosition = { x: 0.5, y: 0.5 } // Normalized coordinates (0.0 to 1.0)
  trailColor = DEFAULT_COLOR
  trails = [] // Array of {x1, y1, x2, y2, color} (normalized)
  trailElements = [] // SVG <line> elements for DOM manipulation
  isExecuting = false
  executionQueue = []
  angle = 0 // Degrees, 0 is UP, Clockwise

  reset() {
    this.dinoPosition.x = 0.5
    this.dinoPosition.y = 0.5
    this.trailColor = DEFAULT_COLOR
    this.trails.length = 0
    this.trailElements.length = 0
    this.isExecuting = false
    this.executionQueue.length = 0
    this.angle = 0
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

  addCommandToHistory(text, success = true) {
    const now = Date.now()

    // If we represent a "new branch" of history (activeCount < length),
    // we must discard the future commands.
    if (this.activeCount < this.commandHistory.length) {
      // Hard delete: Remove trail elements from commands being discarded
      for (let i = this.activeCount; i < this.commandHistory.length; i++) {
        const command = this.commandHistory[i]
        if (command.trailElements) {
          for (const element of command.trailElements) {
            element.remove()
          }
        }
      }
      // Keep indices 0 to activeCount-1
      this.commandHistory.length = this.activeCount
    }

    this.commandHistory.push({
      text,
      timestamp: now,
      success,
      trailElements: [], // Track SVG line elements created by this command
    })

    this.activeCount = this.commandHistory.length

    if (this.commandHistory.length > MAX_HISTORY) {
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

  addTrailSegment(x1, y1, x2, y2, color, element) {
    this.trails.push({ x1, y1, x2, y2, color })
    this.trailElements.push(element)
  }

  setTrailColor(color) {
    this.trailColor = color
  }

  addTrailToCurrentCommand(trailElement) {
    if (this.commandHistory.length > 0) {
      const currentCommand = this.commandHistory[this.commandHistory.length - 1]
      if (currentCommand.trailElements) {
        currentCommand.trailElements.push(trailElement)
      }
    }
  }
}

export const state = new State()
