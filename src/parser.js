import { Direction } from './constants.js';

export class Parser {
  static parse(input) {
    const lines = input.trim().split(/\n+/);
    const commands = [];
    const errors = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0];

      try {
        if (cmd === 'COLOR_SET') {
          if (parts.length !== 2) throw new Error(`Invalid COLOR_SET usage. Expected 1 argument.`);
          const color = parts[1];
          // Basic hex validation
          if (!/^#[0-9A-Fa-f]{8}$/.test(color)) throw new Error(`Invalid hex color format. Use #RRGGBBAA.`);
          commands.push({ type: 'COLOR_SET', color });

        } else if (cmd === 'COLOR_UNSET') {
          commands.push({ type: 'COLOR_UNSET' });

        } else if (cmd === 'MOVE') {
          if (parts.length < 3 || (parts.length - 1) % 2 !== 0) {
            throw new Error(`Invalid MOVE usage. Expected pairs of Length and Direction.`);
          }

          const steps = [];
          for (let i = 1; i < parts.length; i += 2) {
            const length = parseFloat(parts[i]);
            const direction = parts[i + 1];

            if (isNaN(length)) throw new Error(`Invalid length '${parts[i]}'. Must be a number.`);
            if (!Direction[direction]) throw new Error(`Invalid direction '${direction}'.`);

            steps.push({ length, direction });
          }
          commands.push({ type: 'MOVE', steps });

        } else {
          throw new Error(`Unknown command '${cmd}'.`);
        }
      } catch (err) {
        errors.push(`Line ${index + 1}: ${err.message}`);
      }
    });

    return { commands, errors };
  }
}
