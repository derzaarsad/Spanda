import { Notification } from "./finapi-notifications";

/*
 * This module defines the decoder interface, which is responsible for transforming an incoming
 * notification to a target representation.
 */
export default interface NotificationDecoder<I extends Notification, O> {
  map(notification: I): O;
}
