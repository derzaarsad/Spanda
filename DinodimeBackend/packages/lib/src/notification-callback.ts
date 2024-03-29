import * as winston from "winston";
import SNS from "aws-sdk/clients/sns";

import {
  Notification,
  EncryptedNewTransactionsNotification,
  DecryptedNewTransactionsNotification,
} from "./finapi-notifications";
import { NotificationDecoder } from "./notification-decoder";
import { Status, Success, Failure } from "./status";
import { SNSPublisher, PublishInput } from "./sns-publisher";
import { RuleHandle } from "./rule-handle";
import { RuleHandleRepository } from "./rule-handle-repository";

/**
 * This module defines the callback handler interface for components receiving push notifications.
 */
export interface NotificationCallback<N extends Notification> {
  accept(notification: N): Promise<Status<String>>;
}

/**
 * Publishes new transactions on an SNS topic.
 */
export class NewTransactionsSNSPublisher implements NotificationCallback<EncryptedNewTransactionsNotification> {
  private decoder: NotificationDecoder<EncryptedNewTransactionsNotification, DecryptedNewTransactionsNotification>;
  private logger: winston.Logger;
  private ruleHandles: RuleHandleRepository;
  private sns: SNSPublisher;
  private topicArn: string;

  constructor(
    decoder: NotificationDecoder<EncryptedNewTransactionsNotification, DecryptedNewTransactionsNotification>,
    ruleHandles: RuleHandleRepository,
    sns: SNSPublisher,
    topicArn: string,
    logger: winston.Logger
  ) {
    this.decoder = decoder;
    this.ruleHandles = ruleHandles;
    this.sns = sns;
    this.topicArn = topicArn;
    this.logger = logger;
  }

  async accept(notification: EncryptedNewTransactionsNotification): Promise<Status<String>> {
    const validated = this.validateNotification(notification);

    if (!validated) {
      return {
        kind: "failure",
        error: new Error("received an invalid notification " + JSON.stringify(notification)),
      };
    }

    const ruleHandle = await this.ruleHandles.findById(validated.callbackHandle);

    if (!ruleHandle) {
      return Promise.resolve({
        kind: "failure",
        error: new Error("no rule handle found for the callback handle"),
      });
    }

    const params = new PublishInput(this.topicArn, validated, this.messageAttributes(ruleHandle));

    return this.sns
      .publish(params)
      .then((response) => {
        if (response.kind === "success") {
          this.logger.log("info", "notification forwarded successfully");
          const status: Success<String> = {
            kind: "success",
            result: response.result,
          };
          return status;
        } else {
          this.logger.log("info", "error forwarding notification");
          const status: Failure = {
            kind: "failure",
            error: response.error,
          };
          return status;
        }
      })
      .catch((err: any) => {
        this.logger.log("error", "unexpected failure trying to publish message", { cause: err });
        const status: Failure = {
          kind: "failure",
          error: err,
        };
        return status;
      });
  }

  private validateNotification(
    notification: EncryptedNewTransactionsNotification
  ): DecryptedNewTransactionsNotification | null {
    try {
      const decoded = this.decoder.map(notification);

      if (
        !Object.prototype.hasOwnProperty.call(decoded, "notificationRuleId") ||
        !Object.prototype.hasOwnProperty.call(decoded, "triggerEvent") ||
        !Object.prototype.hasOwnProperty.call(decoded, "callbackHandle")
      ) {
        this.logger.error("received an invalid notification", { notification: decoded });
        return null;
      }

      return decoded;
    } catch (err) {
      this.logger.error("error decoding notification", { notification: notification, reason: err });
      return null;
    }
  }

  private messageAttributes(ruleHandle: RuleHandle): SNS.MessageAttributeMap {
    return {
      finApiId: {
        DataType: "Number",
        StringValue: ruleHandle.finApiId.toString(),
      },
      userId: {
        DataType: "String",
        StringValue: ruleHandle.userId,
      },
      type: {
        DataType: "String",
        StringValue: ruleHandle.type,
      },
    };
  }
}

/**
 * The Accumulator callback is useful for unit testing, but not much more.
 */
export class Accumulator<N extends Notification, O> implements NotificationCallback<N> {
  notifications: Array<O>;
  decoder: NotificationDecoder<N, O>;

  constructor(decoder: NotificationDecoder<N, O>) {
    this.decoder = decoder;
    this.notifications = [];
  }

  accept(notification: N): Promise<Status<String>> {
    const decoded: O = this.decoder.map(notification);
    this.notifications.push(decoded);
    return Promise.resolve({ kind: "success", result: this.notifications.length.toString() });
  }

  clear(): void {
    this.notifications = [];
  }
}
