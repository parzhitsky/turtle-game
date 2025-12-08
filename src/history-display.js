import { state } from './state.js'

export class HistoryDisplay {
  constructor(container) {
    this.container = container
    state.subscribe(() => this.render())
  }

  render() {
    this.container.innerHTML = ''

    const history = [...state.commandHistory].reverse()

    history.forEach(item => {
      const div = document.createElement('div')
      div.className = 'history-item'
      div.textContent = `> ${item.text}`
      if (!item.success) {
        div.style.color = '#ff4444'
      }
      this.container.appendChild(div)
    })

    // Auto scroll to bottom
    this.container.scrollTop = this.container.scrollHeight
  }
}
