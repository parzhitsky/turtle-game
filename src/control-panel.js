const runBtn = document.getElementById('btn-run')
const clearBtn = document.getElementById('btn-clear')
const directionBtn = document.getElementById('btn-toggle-direction')
const speedSlider = document.getElementById('speed-slider')
const commandForm = document.getElementById('command-form')

export function onRun(handleRun) {
  commandForm.addEventListener('submit', (e) => {
    e.preventDefault()
    handleRun()
  })
}

export function onToggleDirection(handleToggleDirection) {
  directionBtn.addEventListener('click', handleToggleDirection)
}

export function onClear(handleClear) {
  clearBtn.addEventListener('click', handleClear)
}

export function onSpeedChange(handleSpeedChange) {
  speedSlider.addEventListener('input', (e) => {
    handleSpeedChange(parseInt(e.target.value, 10))
  })
}

export function setRunning(isRunning) {
  runBtn.disabled = isRunning
  clearBtn.disabled = isRunning
  runBtn.textContent = isRunning ? 'Виконується...' : '▶ Запуск'
}
