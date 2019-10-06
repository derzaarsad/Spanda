'use strict'

/*
interface IUser extends mongoose.Document {
    username: string;
    allowance: number;
    isAllowanceReady: boolean;
    email: string;
    phone: string;
    isAutoUpdateEnabled: boolean;
    bankConnections: [number];
}
*/

exports.NewUser = (username, email, phone, isAutoUpdateEnabled) => {
  return {
    'username': username,
    'allowance': 0,
    'isAllowanceReady': false,
    'email': email,
    'phone': phone,
    'isAutoUpdateEnabled': isAutoUpdateEnabled,
    'bankConnections': []
  }
}

exports.NewDynamoUsersRepository = (client, tableName) => {
  const decodeUser = data => {
    return {
      username: data['username']['S'],
      allowance: data['allowance']['N'],
      isAllowanceReady: data['isAllowanceReady']['B'],
      email: data['email']['S'],
      phone: data['phone']['S'],
      isAutoUpdateEnabled: data['isAutoUpdateEnabled']['B'],
      bankConnections: data['bankConnections']['NS']
    }
  }

  const encodeUser = user => {
    return {
      username: { 'S': user.username },
      allowance: { 'N': user.allowance },
      isAllowanceReady: { 'B': user.isAllowanceReady },
      email: { 'S': user.email },
      phone: { 'S': user.phone },
      isAutoUpdateEnabled: { 'B': user.isAutoUpdateEnabled },
      bankConnections: { 'NS': user.bankConnections }
    }
  }

  return {
    findOneById: async (username) => {
      const params = {
        Key: {
          'username': {
            S: username
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
      }).then(data => decodeUser(data));
    },

    save: async (user) => {
      const params = {
        Item: encodeUser(user),
        ReturnConsumedCapacity: "TOTAL",
        TableName: tableName
      }

      return new Promise((resolve, reject) => {
        dynamodb.updateItem(params, function(err, data) {
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

