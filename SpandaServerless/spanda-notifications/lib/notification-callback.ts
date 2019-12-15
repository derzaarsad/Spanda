/*
 * This module defines the callback handler interface for components receiving push notifications.
 */
import {
  Notification,
  EncryptedNewTransactionsNotification,
  DecryptedNewTransactionsNotification
} from "./finapi-notifications";
import NotificationDecoder from "./notification-decoder";
import * as winston from "winston";
import SNS from "aws-sdk/clients/sns";
import RuleHandle from "./rule-handle";
import RuleHandleRepository from "./rule-handle-repository";
import { SNSPublisher, PublishInput, PublishStatus } from "./sns-publisher";

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

/**
 * Publishes new transactions on an SNS topic.
 */
export class NewTransactionsSNSPublisher
  implements NotificationCallback<EncryptedNewTransactionsNotification> {
  private decoder: NotificationDecoder<
    EncryptedNewTransactionsNotification,
    DecryptedNewTransactionsNotification
  >;
  private logger: winston.Logger;
  private ruleHandles: RuleHandleRepository;
  private sns: SNSPublisher;
  private topicArn: string;

  constructor(
    decoder: NotificationDecoder<
      EncryptedNewTransactionsNotification,
      DecryptedNewTransactionsNotification
    >,
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

  async accept(notification: EncryptedNewTransactionsNotification): Promise<CallbackStatus> {
    const validated = this.validateNotification(notification);

    if (!validated) {
      return {
        kind: "failure",
        error: "received an invalid notification " + JSON.stringify(notification)
      };
    }

    const ruleHandle = await this.ruleHandles.findById(validated.callbackHandle);

    if (!ruleHandle) {
      return Promise.resolve({
        kind: "failure",
        error: "no rule handle found for the callback handle"
      });
    }

    const params: PublishInput = {
      topicArn: this.topicArn,
      message: JSON.stringify(validated),
      messageAttributes: this.messageAttributes(ruleHandle)
    };

    return this.sns
      .publish(params)
      .then((response: PublishStatus) => {
        if (response.kind === "success") {
          this.logger.log("info", "notification forwarded successfully");
          const status: CallbackSuccess = {
            kind: "success"
          };
          return status;
        } else {
          this.logger.log("info", "error fowrarding notification");
          const status: CallbackFailure = {
            kind: "failure",
            error: response.error
          };
          return status;
        }
      })
      .catch((err: any) => {
        this.logger.log("error", "unexpected failure trying to publish message", { cause: err });
        const status: CallbackFailure = {
          kind: "failure",
          error: err
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
        this.logger.log("info", "received an invalid notification", decoded);
        return null;
      }

      return decoded;
    } catch (err) {
      this.logger.log("info", "error decoding notification", notification, err);
      return null;
    }
  }

  private messageAttributes(ruleHandle: RuleHandle): SNS.MessageAttributeMap {
    return {
      finApiId: {
        DataType: "Number",
        StringValue: ruleHandle.finApiId.toString()
      },
      userId: {
        DataType: "Number",
        StringValue: ruleHandle.userId.toString()
      },
      type: {
        DataType: "String",
        StringValue: ruleHandle.type
      }
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

  accept(notification: N): Promise<CallbackStatus> {
    const decoded: O = this.decoder.map(notification);
    this.notifications.push(decoded);
    return Promise.resolve({ kind: "success" });
  }

  clear() {
    this.notifications = [];
  }
}
