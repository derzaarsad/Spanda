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
  const decodeBankAccount = data => {
    return {
      id: parseInt(data['id']['N']),
      bankConnectionId: parseInt(data['bankConnectionId']['N']),
      accountName: data['accountName']['S'],
      iban: data['iban']['S'],
      accountCurrency: data['accountCurrency']['S']
    }
  }

  const encodeBankAccount = bankAccount => {
    let expression = "SET #BC = :bc, #A = :a, #I = :i, #C = :c"

    const attributes = {
      '#BC': 'bankConnectionId',
      '#A': 'accountName',
      '#I': 'iban',
      '#C': 'accountCurrency',
    }

    const values = {
      ':bc': { 'N': bankAccount.bankConnectionId.toString() },
      ':a': { 'S': bankAccount.accountName },
      ':i': { 'S': bankAccount.iban },
      ':c': { 'S': bankAccount.accountCurrency }
    }

    return {
      Key: {
        id: { 'N': bankAccount.id.toString() }
      },
      ExpressionAttributeNames: attributes,
      ExpressionAttributeValues: values,
      UpdateExpression: expression
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
        client.getItem(params, function(err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        });
      }).then(data => {
        if (data.Item) {
          return decodeBankAccount(data.Item)
        } else {
          return null
        }
      });
    },

    save: async (bankAccount) => {
      const params = {
        'ReturnValues': "ALL_NEW",
        'TableName': tableName,
        ...encodeBankAccount(bankAccount)
      }

      return new Promise((resolve, reject) => {
        client.updateItem(params, function(err) {
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
