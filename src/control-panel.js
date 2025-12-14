import { toggleOverlay } from './renderer/renderer.js'
import { runScript } from './run-script.js'
import { startAnimation } from './start-animation.js'
import { getScript, clearInput, focusInput } from './script-input/script-input.js'

const runBtn = document.getElementById('btn-run')
const directionBtn = document.getElementById('btn-toggle-direction')
const speedSlider = document.getElementById('speed-slider')
const clearBtn = document.getElementById('btn-clear')

runBtn.addEventListener('click', runScript)
directionBtn.addEventListener('click', toggleOverlay)
clearBtn.addEventListener('click', () => {
  if (getScript().trim() && !confirm('Clear input?')) {
    return
  }

  clearInput()
  focusInput()
})

speedSlider.addEventListener('input', (e) => {
  startAnimation(parseInt(e.target.value, 10))
})

export function setRunning(isRunning) {
  runBtn.disabled = isRunning
  clearBtn.disabled = isRunning
  runBtn.textContent = isRunning ? 'Виконується...' : '▶ Запуск'
}
