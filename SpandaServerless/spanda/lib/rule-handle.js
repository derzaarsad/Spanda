'use strict'

/*
 * This module defines a repository for rule handles.
 * -----------------
 * type RuleHandle {
 *  id: string,
 *  finApiId: number,
 *  userId: number,
 *  type: string,
 *  args: any
 * }
 */

const create = (idGen, finApiId, userId, type, args) => {
  const result = {
    id: idGen(),
    finApiId: finApiId,
    userId: userId,
    type: type
  }
  if (args) {
    result['args'] = args
  }
  return result
}

/*
 * The in-memory implementation is useful for unit testing, but not much more.
 */
exports.NewInMemoryRepository = (idGen) => {
  const repository = {}

  return {
    new: (finApiId, userId, type, args) => create(idGen, finApiId, userId, type, args),

    findById: async (id) => {
      return repository[id]
    },

    save: async (ruleHandle) => {
      repository[ruleHandle.id] = ruleHandle
      return ruleHandle
    }
  }
}

/*
 * The dynamo repository is a rule handle repository backed by DynamoDB (duh).
 */
exports.NewDynamoDbRepository = (idGen, client, tableName) => {
  const decodeRule = data => {
    const result = {
      id: data['id']['S'],
      finApiId: parseInt(data['finApiId']['N']),
      userId: parseInt(data['userId']['N']),
      type: data['type']['S']
    }

    if (data['type']) {
      result['args'] = JSON.parse(data['type']['S']);
    }

    return result;
  }

  const encodeRule = rule => {
    const result = {
      id: {
        S: rule.id
      },
      finApiId: {
        N: rule.finApiId.toString()
      },
      userId: {
        N: rule.userId.toString()
      },
      type: {
        S: rule.type
      }
    }

    if (rule.args) {
      result['args'] = {
        S: JSON.stringify(rule.args)
      }
    }

    return result
  }

  return {
    new: (finApiId, userId, type, args) => create(idGen, finApiId, userId, type, args),

    findById: async (id) => {
      const params = {
        Key: {
          'id': {
            S: id
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
          decodeRule(data.Item)
        } else {
          return undefined
        }
      });
    },

    save: async (ruleHandle) => {
      const params = {
        'ReturnConsumedCapacity': "TOTAL",
        'TableName': tableName,
        'Item': encodeRule(ruleHandle)
      }

      return new Promise((resolve, reject) => {
        client.putItem(params, function(err) {
          if (err) {
            reject(err)
          } else {
            resolve(ruleHandle)
          }
        })
      })
    }
  }
}
