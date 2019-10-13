'use strict'

/*
interface IBankAccount extends mongoose.Document {
    id: number;
    bankConnectionId: number;
    accountName: string;
    iban: string;
    accountCurrency: string;
}
*/

exports.NewInMemoryRepository = () => {
  const repository = {}

  return {
    findById: async (id) => {
      return repository[id]
    },

    save: async (bankAccount) => {
      repository[bankAccount.id] = bankAccount
      return bankAccount
    }
  }
}

exports.NewDynamoDbRepository = (client, tableName) => {
  const decodeBankAccount = data = {
    id: data['id']['N'],
    bankConnectionId: data['bankConnectionId']['N'],
    accountName: data['accountName']['S'],
    iban: data['iban']['S'],
    accountCurrency: data['accountCurrency']['S']
  }

  const encodeBankAccount = bankAccount => {
    return {
      id: { 'N': bankAccount.id },
      bankConnectionId: { 'N': bankAccount.bankConnectionId },
      accountName: { 'S': bankAccount.accountName },
      iban: { 'S': bankAccount.iban },
      accountCurrency: { 'S': bankAccount.accountCurrency }
    }
  }

  return {
    findById: async (id) => {
      const params = {
        Key: {
          'id': {
            N: id
          }
        },
        TableName: tableName
      }

      return new Promise((resolve, reject) => {
        dynamodb.getItem(params, function(err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        });
      }).then(data => decodeBankAccount(data));
    },

    save: async (bankAccount) => {
      const params = {
        Item: encodeBankAccount(bankAccount),
        ReturnConsumedCapacity: "TOTAL",
        TableName: tableName
      }

      return new Promise((resolve, reject) => {
        dynamodb.updateItem(params, function(err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(bankAccount)
          }
        })
      })
    }
  }
}
