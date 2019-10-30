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
    const bankConnection = {
      id: parseInt(data['id']['N']),
      bankId: parseInt(data['bankId']['N']),
    }

    if (data['bankAccountIds']) {
      bankConnection['bankAccountIds'] = data['bankAccountIds']['NS'].map(id => parseInt(id))
    } else {
      bankConnection['bankAccountIds'] = []
    }

    return bankConnection
  }

  const encodeBankConnection = bankConnection => {
    let expression = "SET #B = :b"

    const attributes = {
        '#B': 'bankId',
    }

    const values = {
      ':b': { 'N': bankConnection.bankId.toString() }
    }

    if (bankConnection.bankAccountIds.length > 0) {
      expression = expression + ", #BA = :ba"
      attributes['#BA'] = 'bankAccountIds'
      values[':ba'] = { 'NS': bankConnection.bankConnectionIds.map(id => id.toString()) }
    }

    return {
      Key: {
        id: { 'N': bankConnection.id.toString() }
      },
      ExpressionAttributeNames: attributes,
      ExpressionAttributeValues: values,
      UpdateExpression: expression
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
      }).then(data => {
        if (data.Item) {
          decodeBankConnection(data.Item)
        } else {
          return null
        }
      });
    },

    save: async (bankConnection) => {
      const params = {
        'ReturnValues': "ALL_NEW",
        'TableName': tableName,
        ...encodeBankConnection(bankConnection)
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

exports.NewPostgreSQLRepository = (pool, format, tableName) => {
  const bankconnectionToSql = bankConnection => {
    return [
      bankConnection.id,
      bankConnection.bankId,
      (bankConnection.bankAccountIds.length === 0) ? null :  bankConnection.bankAccountIds
    ];
  }

  return {
    new: createConnection,

    findById: async (id) => {

      return pool.connect().then(client => {
        let text = 'SELECT * FROM ' + tableName + ' WHERE id = ' + id.toString() + ' LIMIT 1';
        
        return client.query(text).then(res => {
          client.release();
          return (res.rowCount === 1) ? res.rows[0] : undefined;
        }).catch(err => {
          client.release();
          throw new Error(err.stack);
        });
      });
    },

    save: async (bankConnection) => {
      return pool.connect().then(client => {
        const properties = 'id,bankid,bankaccountids';
        let text = format('INSERT INTO ' + tableName + '(' + properties + ') VALUES (%L)', bankconnectionToSql(bankConnection));

        return client.query(text).then(res => {
          client.release();
          return user;
        }).catch(err => {
          client.release();
          throw new Error(err.stack);
        });
      });
    }
  }
}