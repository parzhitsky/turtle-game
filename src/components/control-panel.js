import { Config } from '../constants.js';

export class ControlPanel {
  constructor({ runBtn, previewBtn, speedSlider }, callbacks) {
    this.runBtn = runBtn;
    this.previewBtn = previewBtn;
    this.speedSlider = speedSlider;
    this.callbacks = callbacks; // { onRun, onPreview, onSpeedChange }

    this.init();
  }

  init() {
    this.runBtn.addEventListener('click', () => this.callbacks.onRun());
    this.previewBtn.addEventListener('click', () => this.callbacks.onPreview());

    this.speedSlider.addEventListener('input', (e) => {
      this.callbacks.onSpeedChange(parseInt(e.target.value, 10));
    });
  }

  setRunning(isRunning) {
    this.runBtn.disabled = isRunning;
    this.previewBtn.disabled = isRunning;
    this.runBtn.textContent = isRunning ? 'Виконується...' : '▶ Запуск';
  }
}
