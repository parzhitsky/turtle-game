export class CommandInput {
  constructor(element) {
    this.element = element;
  }

  getValue() {
    return this.element.value;
  }

  setValue(text) {
    this.element.value = text;
  }

  clear() {
    this.element.value = '';
  }
}
