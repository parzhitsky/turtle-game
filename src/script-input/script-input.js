const inputElement = document.getElementById('script-input')
const lineNumbersElement = document.getElementById('line-numbers')

function updateLineNumbers() {
  lineNumbersElement.textContent = inputElement.value.split('\n').map((_, i) => i + 1).join('\n')
}

// Callbacks for change events
const listeners = []

function notifyChange() {
  updateLineNumbers()

  for (const listener of listeners) {
    listener()
  }
}

inputElement.addEventListener('input', notifyChange)
inputElement.addEventListener('click', notifyChange)
inputElement.addEventListener('keyup', notifyChange)

inputElement.addEventListener('scroll', () => {
  lineNumbersElement.scrollTop = inputElement.scrollTop
})

inputElement.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    inputElement.form?.requestSubmit()
  }
})

updateLineNumbers()

export function getScript() {
  return inputElement.value
}

export function setScript(script) {
  inputElement.value = script
  notifyChange()
}

export function clearInput() {
  inputElement.value = ''
  notifyChange()
}

export function focusInput() {
  inputElement.focus()
}

export function onScriptChange(callback) {
  listeners.push(callback)
}

export function insertAtCursor(text, cursorOffset = 0, selectionLength = 0) {
  const startPos = inputElement.selectionStart
  const endPos = inputElement.selectionEnd

  inputElement.setRangeText(text, startPos, endPos, 'end')

  // setRangeText with 'end' puts cursor after text. We might want to adjust it.
  // Actually, let's calculate exact positions.
  const newCursorPos = startPos + cursorOffset
  inputElement.setSelectionRange(newCursorPos, newCursorPos + selectionLength)

  focusInput()
  notifyChange()
}

export function getCursorContext() {
  const cursorIndex = inputElement.selectionStart
  const text = inputElement.value

  // Logic to detect if inside interpolation { ... }
  // We scan backwards looking for open brace that hasn't been closed
  let depth = 0
  let isInsideInterpolation = false

  for (let i = cursorIndex - 1; i >= 0; i--) {
    const char = text[i]
    if (char === '}') {
      depth++
    } else if (char === '{') {
      if (depth === 0) {
        // Found an opening brace that encloses us (since we didn't pass a closing one first)
        // Check if it's closed *after* us?
        // Actually, simple "inner-to-outer" logic usually just cares about the nearest unclosed brace
        isInsideInterpolation = true
        break
      }
      depth--
    }
  }

  return { script: text, cursorIndex, isInsideInterpolation }
}
