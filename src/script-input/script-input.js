import { runScript } from '../run-script.js' // TODO: emit an event, subscribe to it in main.js

const inputElement = document.getElementById('command-input')
const lineNumbersElement = document.getElementById('line-numbers')

function updateLineNumbers() {
  lineNumbersElement.textContent = inputElement.value.split('\n').map((_, i) => i + 1).join('\n')
}

inputElement.addEventListener('input', updateLineNumbers)
inputElement.addEventListener('scroll', () => {
  lineNumbersElement.scrollTop = inputElement.scrollTop
})

inputElement.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    runScript()
  }
})

updateLineNumbers()

export function getScript() {
  return inputElement.value
}

export function setScript(script) {
  inputElement.value = script
  updateLineNumbers()
}

export function clearInput() {
  inputElement.value = ''
  updateLineNumbers()
}

export function focusInput() {
  inputElement.focus()
}
