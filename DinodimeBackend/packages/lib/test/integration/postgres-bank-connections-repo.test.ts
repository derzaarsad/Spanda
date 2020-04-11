import chai from "chai";
const expect = chai.expect;

import { Pool } from "pg";
import format from "pg-format";

import { BankConnection } from "../../src/bank-connections";
import { BankConnections } from "../../src/bank-connections";
import { BankConnectionsSchema } from "../../src/schema/bank-connections";

describe("integration: postgres bank connections repository", function () {
  let connections: BankConnections.PostgreSQLRepository;

  before(function () {
    const schema = new BankConnectionsSchema();
    connections = new BankConnections.PostgreSQLRepository(new Pool(), format, schema);
  });

  afterEach(async function () {
    await connections.deleteAll();
  });

  it("returns null when connection not found", async function () {
    const result = await connections.findById(1);
    expect(result).to.be.null;
  });

  it("saves and retrieves a bank connection", async function () {
    const connection = new BankConnection(1, 666);
    await connections.save(connection);

    const result = await connections.findById(1);
    expect(result).to.eql(connection);
  });

  it("saves and retrieves a connection with bank account ids", async function () {
    const connection = new BankConnection(2, 69);
    connection.bankAccountIds.push(1);
    connection.bankAccountIds.push(2);
    await connections.save(connection);

    const result = await connections.findById(2);
    expect(result).to.eql(connection);
  });

  it("deletes a single connection", async function () {
    const connection = new BankConnection(2, 69);
    await connections.save(connection);

    const beforeDelete = await connections.findById(2);
    expect(beforeDelete).to.eql(connection);

    await connections.delete(connection);

    const afterDelete = await connections.findById(2);
    expect(afterDelete).to.be.null;
  });

  it("find by ids", async function () {
    await connections.save(new BankConnection(22, 69));
    await connections.save(new BankConnection(23, 70));
    await connections.save(new BankConnection(24, 71));

    const result = await connections.findByIds([22, 23, 24]);
    expect(result.length).to.equal(3);
    expect(result[0].id).to.equal(22);
    expect(result[1].id).to.equal(23);
    expect(result[2].id).to.equal(24);

    expect(result[0].bankId).to.equal(69);
    expect(result[1].bankId).to.equal(70);
    expect(result[2].bankId).to.equal(71);
  });

  it("find by ids with no ids", async function () {
    await connections.save(new BankConnection(22, 69));
    await connections.save(new BankConnection(23, 70));
    await connections.save(new BankConnection(24, 71));

    const result = await connections.findByIds([]);
    expect(result.length).to.equal(0);
  });

  it("overwrites an existing bank connection on save", async function () {
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
