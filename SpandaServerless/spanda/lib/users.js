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
    'bankConnectionIds': []
  }
}

exports.NewInMemoryRepository = () => {
  const repository = {}

  return {
    new: createUser,

    findById: async (username) => {
      return repository[username]
    },

    save: async (user) => {
      repository[user.username] = user
      return user
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

exports.NewPostgreSQLRepository = (pool, format, tableName) => {
  const userToSql = user => {
    return [
      user.username,
      user.creationDate,
      user.allowance,
      user.isAllowanceReady,
      user.email,
      user.phone,
      user.isAutoUpdateEnabled,
      (user.bankConnectionIds.length === 0) ? null :  user.bankConnectionIds
    ];
  }
  return {
    new: createUser,

    findById: async (username) => {
      return pool.connect().then(client => {
        let text = 'SELECT * FROM ' + tableName + ' WHERE username = \'' + username + '\' LIMIT 1';
        
        return client.query(text).then(res => {
          client.release();
          return (res.rowCount === 1) ? res.rows[0] : undefined;
        }).catch(err => {
          client.release();
          throw new Error(err.stack);
        });
      });
    },

    save: async (user) => {
      return pool.connect().then(client => {
        const properties = 'username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids';
        let text = format('INSERT INTO ' + tableName + '(' + properties + ') VALUES (%L)', userToSql(user));

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