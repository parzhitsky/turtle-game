import { state } from '../state.js';

export class HistoryDisplay {
  constructor(container) {
    this.container = container;
    state.subscribe(() => this.render());
  }

  render() {
    this.container.innerHTML = '';
    // "History displayed bottom-up (last events at bottom)"
    // Since we store history with newest at index 0 (unshift), we should reverse it for display if we append children.
    // OR flex-direction: column-reverse in CSS + simple append.

    // Let's rely on array order. 
    // If we want newest at the bottom visually in a normal flow:
    // [Oldest, ..., Newest]
    // State stores: [Newest, ..., Oldest]

    const history = [...state.commandHistory].reverse();

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.textContent = `> ${item.text}`;
      if (!item.success) {
        div.style.color = '#ff4444';
      }
      this.container.appendChild(div);
    });

    // Auto scroll to bottom
    this.container.scrollTop = this.container.scrollHeight;
  }
}
