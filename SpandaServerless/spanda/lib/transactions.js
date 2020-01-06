'use strict'

const createTransaction = (
    id, accountId, amount, bookingDate, purpose,
    counterPartName, counterPartAccountNumber, counterPartIban, counterPartBlz, counterPartBic, counterPartBankName
    ) => {
  return {
    'id': id,
    'accountId': accountId,
    'absAmount': Math.abs(amount),
    'isExpense': (amount < 0) ? true : false,
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

    findByAccountIds: async (accountIds) => {
      return Object.keys(repository).filter(function(key) { return accountIds.includes(repository[key].accountId); }).map(function(key) {
        return repository[key];
      });
    },

    save: async (transaction) => {
      repository[transaction.id] = transaction
      return transaction
    },

    saveArray: async (transactions) => {
      transactions.forEach(transaction => repository[transaction.id] = transaction);
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

  const findByAccountIdsQuery = (accountIds) => {
    return format('SELECT * FROM %I WHERE accountid in (%L)',
      schema.tableName, accountIds);
  }

  const groupByColumnQuery = (attributesIndex) => {
    const attribute = schema.attributes.split(',')[attributesIndex]
    return format('SELECT ( SELECT array_to_json(array_agg(t)) from (SELECT * FROM %I WHERE %I=b.%I) t ) rw FROM %I b WHERE %I IS NOT NULL GROUP BY %I',
      schema.tableName, attribute, attribute, schema.tableName, attribute, attribute);
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
    const rows = schema.asRows(transactions);
    const attributes = schema.attributes;
    const columns = schema.columns;

    return format('INSERT INTO %I (%s) VALUES %L',
      tableName, attributes, rows);
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

    findByAccountIds: async (accountIds) => {
      const client = await pool.connect();
      const params = {
        text: findByAccountIdsQuery(accountIds),
        rowMode: 'array',
        types: types
      }

      return client.query(params)
        .then(res => (res.rowCount > 0) ? res.rows.map(function(row) { return schema.asObject(row); }) : null)
        .finally(() => { client.release() })
    },

    groupByIban: async () => {
      const client = await pool.connect();
      const params = {
        text: groupByColumnQuery(8),
        rowMode: 'array',
        types: types
      }

      return client.query(params)
        .then(res => (res.rowCount > 0) ? res.rows.map(function(row) { return row[0].map(function(element) { return schema.mapObject(element); }); }) : null)
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
    findByAccountIdsQuery: findByAccountIdsQuery,
    groupByColumnQuery: groupByColumnQuery,
    saveQuery: saveQuery,
    saveArrayQuery: saveArrayQuery,
    deleteAllQuery: deleteAllQuery
  }
}
