class Exception {
  private message_: string

  constructor(message: string) {
    this.message_ = message;
  }

  get why() {
    return this.message_;
  }
}

export default Exception;