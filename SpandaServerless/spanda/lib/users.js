'use strict'

/*
interface IUser extends mongoose.Document {
    username: string;
    allowance: number;
    isAllowanceReady: boolean;
    email: string;
    phone: string;
    isAutoUpdateEnabled: boolean;
    bankConnectionIds: [number];
    activeWebFormId: number;
    activeWebFormAuth: string;
}
*/
const createUser = (username, email, phone, isAutoUpdateEnabled) => {
  return {
    'username': username,
    'creationDate': new Date(),
    'allowance': 0,
    'isAllowanceReady': false,
    'email': email,
    'phone': phone,
    'isAutoUpdateEnabled': isAutoUpdateEnabled,
    'bankConnectionIds': [],
    'activeWebFormId': null,
    'activeWebFormAuth': null
  }
}

exports.NewInMemoryRepository = () => {
  const repository = {}

  return {
    new: createUser,

    findById: async (username) => {
      return repository[username]
    },

    findByWebForm: async (activeWebFormId) => {
      let found
      Object.keys(repository).forEach(function(key) {
        if(repository[key].activeWebFormId == activeWebFormId) {
          found = repository[key];
        }
      })
      return found
    },

    save: async (user) => {
      repository[user.username] = user
      return user
    },

    deleteAll: async () => {
      Object.keys(repository).forEach(function(key) { delete repository[key] })
    }
  }
}

exports.NewDynamoDbRepository = (client, tableName) => {
  const decodeUser = data => {
    const user = {
      username: data['username']['S'],
      allowance: parseFloat(data['allowance']['N']),
      isAllowanceReady: data['isAllowanceReady']['BOOL'] === 'true',
      email: data['email']['S'],
      phone: data['phone']['S'],
      isAutoUpdateEnabled: data['isAutoUpdateEnabled']['BOOL'] === 'true',
    }

    if (data['bankConnectionIds']) {
      user['bankConnectionIds'] = data['bankConnectionIds']['NS'].map(id => parseInt(id))
    } else {
      user['bankConnectionIds'] = []
    }

    return user
  }

  const encodeUser = user => {
    let expression = "SET #A = :a, #AR = :ar, #E = :e, #P = :p, #AU = :au"

    const attributes = {
        '#A': 'allowance',
        '#AR': 'isAllowanceReady',
        '#E': 'email',
        '#P': 'phone',
        '#AU': 'isAutoUpdateEnabled',
    }

    const values = {
      ':a': { 'N': user.allowance.toString() },
      ':ar': { 'BOOL': user.isAllowanceReady.toString() },
      ':e': { 'S': user.email },
      ':p': { 'S': user.phone },
      ':au': { 'BOOL': user.isAutoUpdateEnabled.toString() },
    }

    if (user.bankConnectionIds.length > 0) {
      expression = expression + ", #BC = :bc"
      attributes['#BC'] = 'bankConnectionIds'
      values[':bc'] = { 'NS': user.bankConnectionIds.map(id => id.toString()) }
    }

    return {
      Key: {
        username: { 'S': user.username }
      },
      ExpressionAttributeNames: attributes,
      ExpressionAttributeValues: values,
      UpdateExpression: expression
    }
  }

  return {
    new: createUser,

    findById: async (username) => {
      const params = {
        Key: {
          'username': {
            S: username
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
          return decodeUser(data.Item)
        } else {
          return null
        }
      });
    },

    save: async (user) => {
      const params = {
        'TableName': tableName,
        'ReturnValues': "ALL_NEW",
        ...encodeUser(user)
      }

      return new Promise((resolve, reject) => {
        client.updateItem(params, function(err) {
          if (err) {
            reject(err)
          } else {
            resolve(user)
          }
        })
      })
    }
  }
}

exports.NewPostgreSQLRepository = (pool, format, schema, types) => {
  const findByIdQuery = (userName) => {
    return format('SELECT * FROM %I WHERE username = %L LIMIT 1',
      schema.tableName, userName);
  }

  const findByWebFormQuery = (activeWebFormAuth) => {
    return format('SELECT * FROM %I WHERE activewebformid = %L LIMIT 1',
      schema.tableName, activeWebFormAuth);
  }

  const deleteAllQuery = format('DELETE FROM %I', schema.tableName);

  const saveQuery = (user) => {
    const tableName = schema.tableName;
    const attributes = schema.attributes;
    const columns = schema.columns;
    const row = schema.asRow(user);

    return format('INSERT INTO %I (%s) VALUES (%L) ON CONFLICT (%I) DO UPDATE SET (%s) = (%L) WHERE %I.%I = %L',
      tableName, attributes, row, columns.username, attributes, row, tableName, columns.username, user.username);
  }

  return {
    new: createUser,

    findById: async (username) => {
      const client = await pool.connect();
      const params = {
        text: findByIdQuery(username),
        rowMode: 'array',
        types: types
      }

      return client.query(params)
        .then(res => (res.rowCount > 0) ? schema.asObject(res.rows[0]) : null)
        .finally(() => { client.release() });
    },

    findByWebForm: async (activeWebFormId) => {
      const client = await pool.connect();
      const params = {
        text: findByWebFormQuery(activeWebFormId),
        rowMode: 'array',
        types: types
      }

      return client.query(params)
        .then(res => (res.rowCount > 0) ? schema.asObject(res.rows[0]) : null)
        .finally(() => { client.release() });
    },

    save: async (user) => {
      const client = await pool.connect();

      return client.query(saveQuery(user))
        .then(() => user)
        .finally(() => { client.release() });
    },

    deleteAll: async () => {
      const client = await pool.connect();

      return client.query(deleteAllQuery)
        .then(res => res)
        .finally(() => { client.release() });
    },

    findByIdQuery: findByIdQuery,
    findByWebFormQuery: findByWebFormQuery,
    saveQuery: saveQuery,
    deleteAllQuery: deleteAllQuery
  }
}
