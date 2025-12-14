import { Printer } from './printer.abstract.js'

export class Print extends Printer {
  execute(args) {
    return args.join(' ')
  }
}
