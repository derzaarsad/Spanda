import chai from "chai";
const expect = chai.expect;

import { Pool } from "pg";
import format from "pg-format";

import { BankConnection } from "../../src/bank-connections";
import { BankConnections } from "../../src/bank-connections";
import { BankConnectionsSchema } from "../../src/schema/bank-connections";

describe("postgres bank connections repository", function() {
  let connections: BankConnections.PostgreSQLRepository;

  before(function() {
    const schema = new BankConnectionsSchema();
    connections = new BankConnections.PostgreSQLRepository(new Pool(), format, schema);
  });

  beforeEach(async function() {
    await connections.deleteAll();
  });

  it("returns null when connection not found", async function() {
    const result = await connections.findById(1);
    expect(result).to.be.null;
  });

  it("saves and retrieves a bank connection", async function() {
    const connection = new BankConnection(1, 666);
    await connections.save(connection);

    const result = await connections.findById(1);
    expect(result).to.eql(connection);
  });

  it("saves and retrieves a connection with bank account ids", async function() {
    const connection = new BankConnection(2, 69);
    connection.bankAccountIds.push(1);
    connection.bankAccountIds.push(2);
    await connections.save(connection);

    const result = await connections.findById(2);
    expect(result).to.eql(connection);
  });

  it("overwrites an existing bank connection on save", async function() {
    const connection = new BankConnection(2, 69);
    connection.bankAccountIds.push(1);

    const modifiedConnection = await connections.save(connection);
    modifiedConnection.bankId = 666;
    modifiedConnection.bankAccountIds = [2, 3];
    await connections.save(modifiedConnection);

    const result = await connections.findById(2);
    expect(result).to.eql(modifiedConnection);
  });
});
