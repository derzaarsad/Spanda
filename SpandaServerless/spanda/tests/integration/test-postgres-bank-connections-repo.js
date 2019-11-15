'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const format = require('pg-format');
const { Pool } = require('pg');

const bankConnectionsSchema = require('../../lib/schema/bank-connections');
const types = require('../../lib/schema/types');

const BankConnections = require('../../lib/bank-connections');

describe('postgres bank connections repository', function() {
  let connections

  before(function() {
    connections = BankConnections.NewPostgreSQLRepository(new Pool(), format, bankConnectionsSchema, types);
  })

  beforeEach(async function() {
    await connections.deleteAll();
  })

  it('returns null when connection not found', async function() {
    const result = await connections.findById(1);
    expect(result).to.be.null;
  })

  it('saves and retrieves a bank connection', async function() {
    const connection = connections.new(1, 666);
    await connections.save(connection);

    const result = await connections.findById(1);
    expect(result).to.eql(connection);
  })

  it('saves and retrieves a connection with bank account ids', async function() {
    const connection = connections.new(2, 69);
    connection.bankAccountIds.push(1);
    connection.bankAccountIds.push(2);
    await connections.save(connection);

    const result = await connections.findById(2);
    expect(result).to.eql(connection);
  })
})

