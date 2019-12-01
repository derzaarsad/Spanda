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
