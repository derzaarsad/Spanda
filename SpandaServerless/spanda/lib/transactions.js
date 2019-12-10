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

    findByAccountId: async (accountId) => {
      return Object.keys(repository).filter(function(key) { return repository[key].accountId == accountId; }).map(function(key) {
        return repository[key];
      });
    },

    save: async (transaction) => {
      repository[transaction.id] = transaction
      return transaction
    },

    saveArray: async (transactions) => {
      transactions.forEach(transaction => repository[transaction[0]] = createTransaction(
        transaction[0],
        transaction[1],
        transaction[2],
        transaction[3],
        transaction[4],
        transaction[5],
        transaction[6],
        transaction[7],
        transaction[8],
        transaction[9],
        transaction[10],
        transaction[11]
      ))
      return transactions
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

  const saveArrayQuery = (transactions) => {
    const tableName = schema.tableName;
    const attributes = schema.attributes;
    const columns = schema.columns;

    return format('INSERT INTO %I (%s) VALUES %L',
      tableName, attributes, transactions);
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

    saveArray: async (transactions) => {
      const client = await pool.connect();

      return client.query(saveArrayQuery(transactions))
        .then(() => transactions)
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
    saveArrayQuery: saveArrayQuery,
    deleteAllQuery: deleteAllQuery
  }
}
