'use strict';

const attributes = [
  'id',
  'accountid',
  'absamount',
  'isexpense',
  'bookingdate',
  'purpose',
  'counterpartname',
  'counterpartaccountnumber',
  'counterpartiban',
  'counterpartblz',
  'counterpartbic',
  'counterpartbankname'
];

const asObject = row => {
  return {
    'id': row[0],
    'accountId': row[1],
    'absAmount': row[2],
    'isExpense': row[3],
    'bookingDate': row[4],
    'purpose': row[5],
    'counterPartName': row[6],
    'counterPartAccountNumber': row[7],
    'counterPartIban': row[8],
    'counterPartBlz': row[9],
    'counterPartBic': row[10],
    'counterPartBankName': row[11]
  }
}

module.exports = {
  tableName: 'transactions',

  attributes: attributes.join(','),

  columns: asObject(attributes),

  asRow: transaction => {
    return [
      transaction.id,
      transaction.accountId,
      transaction.absAmount,
      transaction.isExpense,
      transaction.bookingDate,
      transaction.purpose,
      transaction.counterPartName,
      transaction.counterPartAccountNumber,
      transaction.counterPartIban,
      transaction.counterPartBlz,
      transaction.counterPartBic,
      transaction.counterPartBankName
    ];
  },

  asRows: transactions => {
    return transactions.map(function(transaction) {
      return [
        transaction.id,
        transaction.accountId,
        transaction.absAmount,
        transaction.isExpense,
        transaction.bookingDate,
        transaction.purpose,
        transaction.counterPartName,
        transaction.counterPartAccountNumber,
        transaction.counterPartIban,
        transaction.counterPartBlz,
        transaction.counterPartBic,
        transaction.counterPartBankName
      ];
    });
  },

  asObject: row => {
    return asObject(row)
  },

  mapObject: rowObject => {
    return {
      'id': rowObject[attributes[0]],
      'accountId': rowObject[attributes[1]],
      'absAmount': rowObject[attributes[2]],
      'isExpense': rowObject[attributes[3]],
      'bookingDate': rowObject[attributes[4]],
      'purpose': rowObject[attributes[5]],
      'counterPartName': rowObject[attributes[6]],
      'counterPartAccountNumber': rowObject[attributes[7]],
      'counterPartIban': rowObject[attributes[8]],
      'counterPartBlz': rowObject[attributes[9]],
      'counterPartBic': rowObject[attributes[10]],
      'counterPartBankName': rowObject[attributes[11]]
    }
  }
}

