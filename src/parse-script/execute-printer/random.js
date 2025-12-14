export function random(max = 1, min = 0) {
  return Math.floor(Math.random() * (Math.max(min, max) - (min = Math.min(min, max))) + min)
}
