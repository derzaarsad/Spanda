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
    },

    deleteAll: async () => {
      Object.keys(repository).forEach(function(key) { delete repository[key] })
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

exports.NewPostgreSQLRepository = (pool, format, schema, types) => {
  const findByIdQuery = (id) => {
    return format('SELECT * FROM %I WHERE id = %L LIMIT 1',
      schema.tableName, id.toString());
  }

  const deleteAllQuery = format('DELETE FROM %I', schema.tableName);

  const saveQuery = (bankConnection) => {
    const tableName = schema.tableName;
    const row = schema.asRow(bankConnection);
    const attributes = schema.attributes;
    const columns = schema.columns;

    return format('INSERT INTO %I (%s) VALUES (%L) ON CONFLICT (%I) DO UPDATE SET (%s) = (%L) WHERE %I.%I = %L',
      tableName, attributes, row, columns.id, attributes, row, tableName, columns.id, bankConnection.id);
  }

  return {
    new: createConnection,

    findById: async (id) => {
      const client = await pool.connect();
      const params = {
        text: findByIdQuery(id),
        rowMode: 'array',
        types: types
      }

      return client.query(params)
        .then(res => (res.rowCount > 0) ? schema.asObject(res.rows[0]) : null)
        .finally(() => { client.release() })
    },

    save: async (bankConnection) => {
      const client = await pool.connect();

      return client.query(saveQuery(bankConnection))
        .then(() => bankConnection)
        .finally(() => { client.release() });
    },

    deleteAll: async () => {
      const client = await pool.connect();

      return client.query(deleteAllQuery)
        .then(res => res)
        .finally(() => { client.release() });
    },

    findByIdQuery: findByIdQuery,
    saveQuery: saveQuery,
    deleteAllQuery: deleteAllQuery
  }
}
