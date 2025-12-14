import { parseScript } from './parse-script/parse-script.js'
import { draw } from './renderer/renderer.js'
import { state } from './state.js'
import { executeCommandImmediately } from './execute-command-immediately.js'

function restoreState() {
  state.reset()

  const activeCommands = state.commandHistory.slice(0, state.activeCount)

  for (const item of activeCommands) {
    if (!item.success) continue
    const { commands } = parseScript(item.text)
    for (const cmd of commands) {
      executeCommandImmediately(cmd)
    }
  }

  draw()
}

export function handleRevert(index) {
  // Soft delete: Hide trail elements from commands after the revert point
  for (let i = index + 1; i < state.commandHistory.length; i++) {
    const command = state.commandHistory[i]
    if (command.trailElements) {
      for (const element of command.trailElements) {
        element.style.display = 'none'
      }
    }
  }

  // Show trail elements from commands up to and including the revert point
  for (let i = 0; i <= index; i++) {
    const command = state.commandHistory[i]
    if (command.trailElements) {
      for (const element of command.trailElements) {
        element.style.display = ''
      }
    }
  }

  state.setActiveCount(index + 1)
  restoreState()
}
