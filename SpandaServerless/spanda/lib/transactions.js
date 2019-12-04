'use strict'

const createTransaction = (
    id, accountId, amount, bookingDate, purpose,
    counterPartName, counterPartAccountNumber, counterPartIban, counterPartBlz, counterPartBic, counterPartBankName
    ) => {
  return {
    'id': id,
    'accountId': accountId,
    'amount': amount,
    'bookingDate': bookingDate,
    'purpose': purpose,
    'counterPartName': counterPartName,
    'counterPartAccountNumber': counterPartAccountNumber,
    'counterPartIban': counterPartIban,
    'counterPartBlz': counterPartBlz,
    'counterPartBic': counterPartBic,
    'counterPartBankName': counterPartBankName
  }
}

exports.NewInMemoryRepository = () => {
  const repository = {}

  return {
    new: createTransaction,

    findById: async (id) => {
      return repository[id]
    },

    save: async (transaction) => {
      repository[transaction.id] = transaction
      return transaction
    },

    deleteAll: async () => {
      Object.keys(repository).forEach(function(key) { delete repository[key] })
    }
  }
}

exports.NewPostgreSQLRepository = (pool, format, schema, types) => {
  const findByIdQuery = (id) => {
    return format('SELECT * FROM %I WHERE id = %L LIMIT 1',
      schema.tableName, id.toString());
  }

  const deleteAllQuery = format('DELETE FROM %I', schema.tableName);

  const saveQuery = (transaction) => {
    const tableName = schema.tableName;
    const row = schema.asRow(transaction);
    const attributes = schema.attributes;
    const columns = schema.columns;

    return format('INSERT INTO %I (%s) VALUES (%L)',
      tableName, attributes, row);
  }

  return {
    new: createTransaction,

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

    save: async (transaction) => {
      const client = await pool.connect();

      return client.query(saveQuery(transaction))
        .then(() => transaction)
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
