'use strict'

/*
interface IBankConnection extends mongoose.Document {
    id: number;
    bankId: number;
    bankAccounts: [number];
}
*/

const createConnection = (id, bankId) => {
  return {
    'id': id,
    'bankId': bankId,
    'bankAccounts': []
  }
}

exports.NewInMemoryRepository = () => {
  const repository = {}

  return {
    new: createConnection,

    findById: async (id) => {
      return repository[id]
    },

    save: async (bankConnection) => {
      repository[bankConnection.id] = bankConnection
      return bankConnection
    }
  }
}

exports.NewDynamoDbRepository = (client, tableName) => {
  const decodeBankConnection = data => {
    return {
      id: data['id']['N'],
      bankId: data['bankId']['N'],
      bankAccounts: data['bankAccounts']['NS']
    }
  }

  const encodeBankConnection = bankConnection => {
    return {
      id: { 'N': bankConnection.id },
      bankId: { 'N': bankConnection.bankId },
      bankAccounts: { 'NS': bankConnection.bankAccounts }
    }
  }

  return {
    new: createConnection,

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
      }).then(data => decodeBankConnection(data));
    },

    save: async (bankConnection) => {
      const params = {
        Item: encodeBankConnection(bankConnection),
        ReturnConsumedCapacity: "TOTAL",
        TableName: tableName
      }

      return new Promise((resolve, reject) => {
        dynamodb.updateItem(params, function(err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(bankConnection)
          }
        })
      })
    }
  }
}
