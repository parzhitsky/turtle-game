import { state } from './state.js'
import { createHistoryItem } from './create-history-item.js'

const container = document.getElementById('history-list')

export function render() {
  container.innerHTML = ''

  for (const [index, item] of state.commandHistory.entries()) {
    container.appendChild(createHistoryItem(item, index))
  }

  container.scrollTop = container.scrollHeight
}
