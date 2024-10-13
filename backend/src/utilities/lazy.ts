type Initializer<T> = () => T;

class Lazy<T> { 
  private instance_: T | null;
  private initializer_: Initializer<T>;

  constructor(initializer: Initializer<T>) {
    this.instance_ = null;
    this.initializer_ = initializer;
  }

  get instance() {
    if (this.instance_ === null) {
      this.instance_ = this.initializer_();
    }

    return this.instance_;
  }
}

export default Lazy