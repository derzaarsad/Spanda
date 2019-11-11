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
  const schema = 'id,bankid,bankaccountids';

  const bankconnectionToSql = bankConnection => {
    return [
      bankConnection.id,
      bankConnection.bankId,
      (bankConnection.bankAccountIds.length === 0) ? null : bankConnection.bankAccountIds
    ];
  }

  const findByIdQuery = (id) => format('SELECT * FROM %I WHERE id = %L LIMIT 1', tableName, id.toString());

  const saveQuery = (bankConnection) => format('INSERT INTO %I (%s) VALUES (%L)', tableName, schema, bankconnectionToSql(bankConnection));

  return {
    new: createConnection,

    findById: async (id) => {
      const client = await pool.connect();

      return client.query(findByIdQuery(id))
        .then(res => (res.rowCount === 1) ? res.rows[0] : undefined)
        .finally(() => client.release())
    },

    save: async (bankConnection) => {
      const client = await pool.connect();

      return client.query(saveQuery(bankConnection))
        .then(() => bankConnection)
        .finally(() => client.release());
    },

    findByIdQuery: findByIdQuery,
    saveQuery: saveQuery
  }
}
