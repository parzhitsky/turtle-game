@parse-move.js:
  parseMove:
    TODO: allow interpolation of direction too

@parse-command/:
  blocks and stacks are their own module (e.g., `new Block(…)`, `getCurrentBlock(…)`, `addBlock(…)` …)

@renderer/:
  hide/show overlay instead of creating/destroying it; it's a DOM element, we can rotate it

what's the difference between apply-move.js and move-step-instant.js?

@start-animation.js:
  redefine as exporting Animation class

@state.js:
  setActiveCount:
    useless
    should be a part of `restoreState` (add parameter)
