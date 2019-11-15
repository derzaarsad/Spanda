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

const asObject = row => {
  return {
    'username': row[0],
    'creationDate': row[1],
    'allowance': row[2],
    'isAllowanceReady': row[3],
    'email': row[4],
    'phone': row[5],
    'isAutoupdateEnabled': row[6],
    'bankConnectionIds': row[7],
    'activeWebformId': row[8],
    'activeWebformAuth': row[9]
  }
}

module.exports = {
  tableName: 'users',

  attributes: attributes.join(','),

  columns: asObject(attributes),

  asRow: user => {
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
  },

  asObject: row => {
    return asObject(row);
  }
}
