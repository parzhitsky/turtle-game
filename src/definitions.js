export const commands = [
  {
    label: 'MOVE',
    template: 'MOVE 100 FORWARD',
    cursorOffset: 5,
    selectionLength: 3
  },
  {
    label: 'COLOR_SET',
    template: 'COLOR_SET #00FF88FF',
    cursorOffset: 10,
    selectionLength: 7
  },
  {
    label: 'COLOR_UNSET',
    template: 'COLOR_UNSET\n',
    cursorOffset: 12,
    selectionLength: 0
  },
  {
    label: 'REPEAT_TIMES',
    template: 'REPEAT_TIMES 4\n  \nREPEAT_TIMES DONE',
    cursorOffset: 17, // After newline and two spaces
    selectionLength: 0
  },
  {
    label: 'ROTATION_SET',
    template: 'ROTATION_SET 0',
    cursorOffset: 13,
    selectionLength: 1
  },
  {
    label: 'ROTATE',
    template: 'ROTATE 90',
    cursorOffset: 7,
    selectionLength: 2
  },
  {
    label: '{…}',
    template: '{ }',
    cursorOffset: 2,
    selectionLength: 0
  }
]

export const printers = [
  {
    label: 'PRINT',
    template: 'PRINT ',
    cursorOffset: 6,
    selectionLength: 0
  },
  {
    label: 'RANDOM_INT',
    template: 'RANDOM_INT',
    cursorOffset: 10,
    selectionLength: 0
  },
  {
    label: 'HEX',
    template: 'HEX ',
    cursorOffset: 4,
    selectionLength: 0
  },
  {
    label: 'RANDOM_HEX',
    template: 'RANDOM_HEX',
    cursorOffset: 10,
    selectionLength: 0
  },
  {
    label: '{…}',
    template: '{ }',
    cursorOffset: 2,
    selectionLength: 0
  }
]
