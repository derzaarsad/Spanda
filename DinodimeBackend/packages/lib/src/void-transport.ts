import TransportStream = require("winston-transport");
import { TransportStreamOptions } from "winston-transport";

export default class VoidTransport extends TransportStream {
  constructor(opts?: TransportStreamOptions) {
    super(opts);
  }

  log() {
    // this transport does nothing
  }
}
