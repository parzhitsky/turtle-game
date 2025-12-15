import { commands, printers } from './definitions.js'
import { renderBadges } from './render-badges.js'
import { insertAtCursor, getCursorContext } from './script-input/script-input.js'

function handleBadgeClick(badge) {
  insertAtCursor(badge.template, badge.cursorOffset, badge.selectionLength)
  // Logic to update badges immediately after insertion if context changes is handled by onScriptChange in main.js
}

export function updateBadges() {
  const { isInsideInterpolation } = getCursorContext()

  const currentBadges = isInsideInterpolation ? printers : commands

  renderBadges(currentBadges, handleBadgeClick)
}
