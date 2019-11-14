'use strict';

const attributes = [
  'username',
  'creationdate',
  'allowance',
  'isallowanceready',
  'email',
  'phone',
  'isautoupdateenabled',
  'bankconnectionids',
  'activewebformid',
  'activewebformauth'
];

module.exports = {
  tableName: 'users',

  attributes: attributes.join(','),

  columns: {
    'username': attributes[0],
    'creationDate': attributes[1],
    'allowance': attributes[2],
    'isAllowanceReady': attributes[3],
    'email': attributes[4],
    'phone': attributes[5],
    'isAutoupdateEnabled': attributes[6],
    'bankConnectionIds': attributes[7],
    'activeWebformId': attributes[8],
    'activeWebformAuth': attributes[9]
  },

  map: user => {
    return [
      user.username,
      user.creationDate,
      user.allowance,
      user.isAllowanceReady,
      user.email,
      user.phone,
      user.isAutoUpdateEnabled,
      (user.bankConnectionIds.length === 0) ? null :  "{" + user.bankConnectionIds.join(',') + "}",
      user.activeWebFormId,
      user.activeWebFormAuth
    ];
  }
}
