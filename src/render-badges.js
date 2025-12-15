const container = document.getElementById('command-badges-container')

export function renderBadges(badgesList, onBadgeClick) {
  // Clear container
  container.innerHTML = ''

  for (const badge of badgesList) {
    const badgeEl = document.createElement('div')
    badgeEl.className = 'badge'
    badgeEl.textContent = badge.label
    badgeEl.addEventListener('click', () => onBadgeClick(badge))

    container.appendChild(badgeEl)
  }
}
