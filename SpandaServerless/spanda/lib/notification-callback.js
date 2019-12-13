'use strict'

/*
 * This module defines the callback handler interface for components receiving push notifications.
 *
 * type CallbackSuccess = {
 *   kind: 'success'
 * }
 *
 * type CallbackFailure = {
 *   kind: 'failure',
 *   error: any
 * }
 *
 * type CallbackStatus = CallbackSuccess | CallbackFailure
 *
 * type NotificationCallback = {
 *   accept: async(notification) => CallbackStatus
 * }
 */

/*
 * The SNS Publisher implementation publishes the notification to a sns topic.
 */
exports.NewSNSPublisher = (decoder, ruleHandles, sns, topicArn, logger) => {
  const validateNotification = (notification) => {
    try {
      const decoded = decoder.map(notification);

      if (!Object.prototype.hasOwnProperty.call(decoded, "notificationRuleId")
        || !Object.prototype.hasOwnProperty.call(decoded, "triggerEvent")
        || !Object.prototype.hasOwnProperty.call(decoded, "callbackHandle")) {
        logger.log('info', 'received an invalid notification', decoded);
        return null;
      }

      return decoded;
    } catch (err) {
      logger.log('info', 'error decoding notification', notification, err);
      return null;
    }
  }

  const messageAttributes = (ruleHandle) => {
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
    }
  }

  return {
    accept: async (notification) => {
      const validated = validateNotification(notification);

      if (!validated) {
        return {
          kind: 'failure',
          error: 'received an invalid notification ' + JSON.stringify(notification)
        }
      }

      const ruleHandle = await ruleHandles.findById(validated.callbackHandle);

      if (!ruleHandle) {
        return {
          kind: 'failure',
          error: 'no rule handle found for the callback handle'
        }
      }

      const params = {
        TopicArn: topicArn,
        MessageStructure: 'json',
        Message: JSON.stringify(validated),
        ...messageAttributes(ruleHandle)
      }

      return new Promise((resolve, reject) => {
        sns.publish(params, function(err) {
          if (err) {
            logger.log('error', 'could not publish notification', { 'cause': err } );

            reject({
              kind: 'failure',
              error: err
            });
          } else {
            logger.log('info', 'notification forwarded successfully');

            resolve({
              kind: 'success'
            });
          }
        });
      });
    }
  }
}

/*
 * The Accumulator implementation is useful for unit testing, but not much more.
 */
exports.NewAccumulator = (decoder) => {
  let notifications = [];

  return {
    accept: async (notification) => {
      if (!notification) {
        return undefined;
      }

      const decoded = decoder.map(notification);
      notifications.push(decoded);

      return { kind: 'success' };
    },

    notifications: notifications,

    clear: () => {
      notifications = [];
    }
  }
}
