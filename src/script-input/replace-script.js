import { getScript, setScript, focusInput } from './script-input.js'

export function replaceScript(script) {
  if (getScript().trim() && !confirm('Replace current input?')) {
    return
  }

  setScript(script)
  focusInput()
}
