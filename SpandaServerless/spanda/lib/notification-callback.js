'use strict'

/*
 * This module defines the callback interface of components receiving push notifications.
 */

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
      return decoded;
    },

    notifications: notifications,

    clear: () => {
      notifications = [];
    }
  }
}
