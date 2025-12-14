import { onRun, onClear, onToggleDirection, onSpeedChange } from './control-panel.js'
import { resize, toggleOverlay } from './renderer.js'
import { render } from './render.js'
import { runScript } from './run-script.js'
import { focusInput, getScript, clearInput } from './script-input/script-input.js'
import { setAnimationSpeed } from './start-animation.js'
import { state } from './state.js'

state.subscribe(render)

onRun(runScript)
onToggleDirection(toggleOverlay)
onSpeedChange(setAnimationSpeed)
onClear(() => {
  if (!getScript().trim() || confirm('Clear input?')) {
    clearInput()
    focusInput()
  }
})

resize()
focusInput()
