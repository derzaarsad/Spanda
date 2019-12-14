/*
 * This module defines the callback handler interface for components receiving push notifications.
 */

import { Notification } from "./finapi-notifications";
import NotificationDecoder from "./notification-decoder";
import * as winston from "winston";
import SNS from "aws-sdk/clients/sns";

export type CallbackSuccess = {
  kind: "success";
};

export type CallbackFailure = {
  kind: "failure";
  error: any;
};

export type CallbackStatus = CallbackSuccess | CallbackFailure;

export interface NotificationCallback<N extends Notification> {
  accept(notification: N): Promise<CallbackStatus>;
}

export class SNSPublisher<N extends Notification, O> implements NotificationCallback<N> {
  private decoder: NotificationDecoder<N, O>;
  private logger: winston.Logger;

  constructor(decoder: NotificationDecoder<N, O>, logger: winston.Logger) {
    this.decoder = decoder;
    this.logger = logger;
  }

  accept(notification: N): Promise<CallbackStatus> {
    throw new Error("Method not implemented.");
  }

  private validateNotifciccation(notification: N): O | null {
    try {
      const decoded = this.decoder.map(notification);

      if (
        !Object.prototype.hasOwnProperty.call(decoded, "notificationRuleId") ||
        !Object.prototype.hasOwnProperty.call(decoded, "triggerEvent") ||
        !Object.prototype.hasOwnProperty.call(decoded, "callbackHandle")
      ) {
        this.logger.log("info", "received an invalid notification", decoded);
        return null;
      }

      return decoded;
    } catch (err) {
      this.logger.log("info", "error decoding notification", notification, err);
      return null;
    }
  }
}

/*
 * The Accumulator callback is useful for unit testing, but not much more.
 */
export class Accumulator<N extends Notification, O> implements NotificationCallback<N> {
  notifications: Array<O>;
  decoder: NotificationDecoder<N, O>;

  constructor(decoder: NotificationDecoder<N, O>) {
    this.decoder = decoder;
    this.notifications = [];
  }

  accept(notification: N): Promise<CallbackStatus> {
    const decoded: O = this.decoder.map(notification);
    this.notifications.push(decoded);
    return Promise.resolve({ kind: "success" });
  }

  clear() {
    this.notifications = [];
  }
}
