export class ControlPanel {
  constructor({ runBtn, speedSlider, directionBtn, clearBtn }, callbacks) {
    this.runBtn = runBtn
    this.speedSlider = speedSlider
    this.directionBtn = directionBtn
    this.clearBtn = clearBtn
    this.callbacks = callbacks // { onRun, onSpeedChange, onToggleDirection, onClear }

    this.init()
  }

  init() {
    this.runBtn.addEventListener('click', () => this.callbacks.onRun())
    this.directionBtn.addEventListener('click', () => this.callbacks.onToggleDirection())
    this.clearBtn.addEventListener('click', () => this.callbacks.onClear())

    this.speedSlider.addEventListener('input', (e) => {
      this.callbacks.onSpeedChange(parseInt(e.target.value, 10))
    })
  }

  setRunning(isRunning) {
    this.runBtn.disabled = isRunning
    this.clearBtn.disabled = isRunning
    this.runBtn.textContent = isRunning ? 'Виконується...' : '▶ Запуск'
  }
}
