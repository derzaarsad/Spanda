'use strict';

const attributes = [
  'id',
  'bankid',
  'bankaccountids',
];

const asObject = row => {
  return {
    'id': row[0],
    'bankId': row[1],
    'bankAccountIds': (row[2]) ? row[2] : [],
  }
}

module.exports = {
  tableName: 'bankconnections',

  attributes: attributes.join(','),

  columns: asObject(attributes),

  asRow: bankConnection => {
    return [
      bankConnection.id,
      bankConnection.bankId,
      (bankConnection.bankAccountIds.length === 0) ? null : "{" + bankConnection.bankAccountIds.join(',') + "}"
    ];
  },

  asObject: row => {
    return asObject(row)
  }
}

