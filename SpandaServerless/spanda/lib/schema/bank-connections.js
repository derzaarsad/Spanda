'use strict';

const attributes = [
  'id',
  'bankid',
  'bankaccountids',
];

module.exports = {
  tableName: 'bankconnections',

  attributes: attributes.join(','),

  columns: {
    'id': attributes[0],
    'bankId': attributes[1],
    'bankAccountIds': attributes[2],
  },

  map: bankConnection => {
    return [
      bankConnection.id,
      bankConnection.bankId,
      (bankConnection.bankAccountIds.length === 0) ? null : "{" + bankConnection.bankAccountIds.join(',') + "}"
    ];
  }
}

