'use strict'

/*
interface IBankConnection extends mongoose.Document {
    id: number;
    bankId: number;
    bankAccountIds: [number];
}
*/

const createConnection = (id, bankId) => {
  return {
    'id': id,
    'bankId': bankId,
    'bankAccountIds': []
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
      bankAccountIds: data['bankAccountIds']['NS']
    }
  }

  const encodeBankConnection = bankConnection => {
    return {
      id: { 'N': bankConnection.id },
      bankId: { 'N': bankConnection.bankId },
      bankAccountIds: { 'NS': bankConnection.bankAccountIds }
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
        client.getItem(params, function(err, data) {
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
        client.updateItem(params, function(err) {
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
