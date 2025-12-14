import { state } from '../state.js'
import { createOverlayGroup } from './create-overlay-group.js'

// Module state
const svg = document.getElementById('game-svg')
const dino = document.getElementById('dino')
const trailsGroup = document.getElementById('trails-group')

let overlayGroup = null
let width = 0
let height = 0
let showDirectionOverlay = false

export function getWidth() {
  return width
}

export function getHeight() {
  return height
}

function toPixels(x, y) {
  return {
    x: x * width,
    y: y * height,
  }
}

function updateDinoPosition() {
  const pos = toPixels(state.dinoPosition.x, state.dinoPosition.y)
  dino.style.left = `${pos.x}px`
  dino.style.top = `${pos.y}px`
}

function updateOverlay() {
  // Remove old overlay if exists
  if (overlayGroup) {
    overlayGroup.remove()
    overlayGroup = null
  }

  if (!showDirectionOverlay) return

  const center = toPixels(state.dinoPosition.x, state.dinoPosition.y)
  overlayGroup = createOverlayGroup(center, state.angle)
  svg.appendChild(overlayGroup)
}

export function draw() {
  updateDinoPosition()
  updateOverlay()
}

export function resize() {
  const parent = svg.parentElement
  width = parent.clientWidth
  height = parent.clientHeight

  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

  draw()
}

export function addTrailElement(trail) {
  const start = toPixels(trail.x1, trail.y1)
  const end = toPixels(trail.x2, trail.y2)

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line.setAttribute('x1', start.x)
  line.setAttribute('y1', start.y)
  line.setAttribute('x2', end.x)
  line.setAttribute('y2', end.y)
  line.setAttribute('stroke', trail.color)
  line.setAttribute('stroke-width', 2)
  line.setAttribute('stroke-linecap', 'round')

  trailsGroup.appendChild(line)
  return line
}

export function toggleOverlay() {
  showDirectionOverlay = !showDirectionOverlay
  updateOverlay()
}

new ResizeObserver(resize)
  .observe(svg.parentElement)
