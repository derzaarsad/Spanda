const Transport = require('winston-transport');

module.exports = class VoidTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log() {
    // this transport does nothing
  }
};
