import { state } from './state.js'

export class HistoryDisplay {
  constructor(container, onRevert, onCopy) {
    this.container = container
    this.onRevert = onRevert
    this.onCopy = onCopy
    state.subscribe(() => this.render())
  }

  render() {
    this.container.innerHTML = ''


    state.commandHistory.forEach((item, index) => {
      const div = document.createElement('div')
      div.className = 'history-item'

      // Determine if inactive
      // activeCount is number of active items from START of array.
      // So indices 0 to activeCount-1 are active.
      // Indices >= activeCount are inactive.
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
      copyBtn.onclick = () => this.onCopy(item.text)
      actionsDiv.appendChild(copyBtn)

      // Revert Button - Only for successful commands
      if (item.success) {
        const revertBtn = document.createElement('button')
        revertBtn.textContent = '↺'
        revertBtn.className = 'history-btn revert'
        revertBtn.title = 'Revert to this point'
        revertBtn.onclick = () => this.onRevert(index)
        actionsDiv.appendChild(revertBtn)
      } else {
        div.style.color = '#ff4444'
      }

      div.appendChild(actionsDiv)

      this.container.appendChild(div)
    })

    // Auto scroll to bottom
    this.container.scrollTop = this.container.scrollHeight
  }
}
