export class CommandInput {
  constructor(inputElement, lineNumbersElement, callbacks = {}) {
    this.inputElement = inputElement
    this.lineNumbersElement = lineNumbersElement
    this.onEnter = callbacks.onEnter

    this.init()
  }

  init() {
    this.inputElement.addEventListener('input', () => this.updateLineNumbers())
    this.inputElement.addEventListener('scroll', () => this.syncScroll())
    this.inputElement.addEventListener('keydown', (e) => this.handleKeydown(e))
    this.updateLineNumbers() // Initial state
  }

  handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (this.onEnter) this.onEnter()
    }
  }

  getValue() {
    return this.inputElement.value
  }

  setValue(text) {
    this.inputElement.value = text
    this.updateLineNumbers()
  }

  clear() {
    this.inputElement.value = ''
    this.updateLineNumbers()
  }

  focus() {
    this.inputElement.focus()
  }

  updateLineNumbers() {
    const lines = this.inputElement.value.split('\n').length
    // "start from 1 and only for the non-empty range... there is always the first line"
    // split('\n') gives 1 for empty string. 
    // If text is "a\n", split gives ["a", ""] -> 2 lines. Correct.

    const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n')
    this.lineNumbersElement.textContent = numbers
  }

  syncScroll() {
    this.lineNumbersElement.scrollTop = this.inputElement.scrollTop
  }
}
