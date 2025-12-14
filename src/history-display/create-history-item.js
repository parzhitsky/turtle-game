import { state } from '../state.js'
import { replaceScript } from '../script-input/replace-script.js'
import { handleRevert } from './handle-revert.js'

export function createHistoryItem(item, index) {
  const div = document.createElement('div')
  div.className = 'history-item'

  // Mark as inactive if beyond state.activeCount
  if (index >= state.activeCount) {
    div.classList.add('inactive')
  }

  // Text container
  const textSpan = document.createElement('span')
  textSpan.className = 'history-item__text'
  textSpan.textContent = `> ${item.text}`
  textSpan.title = 'Click to expand'
  textSpan.onclick = () => {
    div.classList.toggle('expanded')
  }
  div.appendChild(textSpan)

  // Actions container
  const actionsDiv = document.createElement('div')
  actionsDiv.className = 'history-item__actions'

  // Copy Button
  const copyBtn = document.createElement('button')
  copyBtn.textContent = '📋'
  copyBtn.className = 'history-btn copy'
  copyBtn.title = 'Copy'
  copyBtn.onclick = () => replaceScript(item.text)
  actionsDiv.appendChild(copyBtn)

  // Revert Button - Only for successful commands
  if (item.success) {
    const revertBtn = document.createElement('button')
    revertBtn.textContent = '↺'
    revertBtn.className = 'history-btn revert'
    revertBtn.title = 'Revert to this point'
    revertBtn.onclick = () => handleRevert(index)
    actionsDiv.appendChild(revertBtn)
  } else {
    div.style.color = '#ff4444'
  }

  div.appendChild(actionsDiv)

  return div
}
