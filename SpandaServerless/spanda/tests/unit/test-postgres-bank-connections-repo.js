'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const format = require('pg-format');

const BankConnections = require('../../lib/bank-connections');
const bankConnectionsSchema = require('../../lib/schema/bank-connections');

describe('postgres bank connections repository', function() {
  let connections

  beforeEach(function() {
    connections = BankConnections.NewPostgreSQLRepository(null, format, bankConnectionsSchema);
  })

  it('renders the find-by-id query', async function() {
    const result = await connections.findByIdQuery(1);
    expect(result).to.be.a('string');
    expect(result).to.equal("SELECT * FROM bankconnections WHERE id = '1' LIMIT 1");
  })

  it('renders the save query with an emtpy account ids', async function() {
    const connection = connections.new(1, 666);

    const result = connections.saveQuery(connection);
    expect(result).to.be.a('string');
    expect(result).to.equal("INSERT INTO bankconnections (id,bankid,bankaccountids) VALUES ('1','666',NULL)");
  })

  it('renders the save query with some account ids', async function() {
    const connection = connections.new(2, 69);
    connection.bankAccountIds.push(1);
    connection.bankAccountIds.push(2);

    const result = connections.saveQuery(connection);
    expect(result).to.be.a('string');
    expect(result).to.equal("INSERT INTO bankconnections (id,bankid,bankaccountids) VALUES ('2','69','{1,2}')");
  })
})
