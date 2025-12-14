import { clearInput, focusInput, getScript } from './script-input/script-input.js'
import { parseScript } from './parse-script/parse-script.js'
import { state } from './state.js'
import { startAnimation } from './start-animation.js'

export function runScript() {
  const script = getScript()

  if (!script.trim()) {
    return
  }

  const { commands, errors } = parseScript(script)

  if (errors.length > 0) {
    state.addCommandToHistory(`ERRORS:\n${errors.join('\n')}`, false)
  } else {
    state.addCommandToHistory(script, true)

    clearInput()
    focusInput()
    startAnimation(commands)
  }
}
