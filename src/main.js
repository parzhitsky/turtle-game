import { onRun, onClear, onToggleDirection, onSpeedChange } from './control-panel.js'
import { resize, toggleOverlay } from './renderer.js'
import { render } from './render.js'
import { runScript } from './run-script.js'
import { focusInput, getScript, clearInput, onScriptChange } from './script-input/script-input.js'
import { updateBadges } from './update-badges.js'
import { setAnimationSpeed } from './start-animation.js'
import { state } from './state.js'

state.subscribe(render)

onScriptChange(updateBadges)
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
updateBadges()
