import chai from "chai";
const expect = chai.expect;

import format from "pg-format";

import { BankConnection } from "../../src/bank-connections";
import { BankConnections } from "../../src/bank-connections";
import { BankConnectionsSchema } from "../../src/schema/bank-connections";

describe("unit: postgres bank connections repository", function() {
  let connections: BankConnections.PostgreSQLRepository;

  beforeEach(function() {
    const schema = new BankConnectionsSchema();
    connections = new BankConnections.PostgreSQLRepository(undefined, format, schema);
  });

  it("renders the find-by-id query", async function() {
    const result = connections.findByIdQuery(1);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM bankconnections WHERE id = '1' LIMIT 1");
  });

  it("renders the find-by-ids query", async function() {
    const result = connections.findByIdsQuery([1,2,3]);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM bankconnections WHERE id in ('1','2','3')");
  });

  it("renders the save query with an emtpy account ids", async function() {
    const connection = new BankConnection(1, 666);

    const result = connections.saveQuery(connection);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO bankconnections (id,bankid,bankaccountids) VALUES ('1','666',NULL) ON CONFLICT (id) DO UPDATE SET (id,bankid,bankaccountids) = ('1','666',NULL) WHERE bankconnections.id = '1'"
    );
  });

  it("renders the save query with some account ids", async function() {
    const connection = new BankConnection(2, 69);
    connection.bankAccountIds.push(1);
    connection.bankAccountIds.push(2);

    const result = connections.saveQuery(connection);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO bankconnections (id,bankid,bankaccountids) VALUES ('2','69','{1,2}') ON CONFLICT (id) DO UPDATE SET (id,bankid,bankaccountids) = ('2','69','{1,2}') WHERE bankconnections.id = '2'"
    );
  });

  it("renders the delete all query", async function() {
    const result = connections.deleteAllQuery();
    expect(result).to.be.a("string");
    expect(result).to.equal("DELETE FROM bankconnections");
  });
});
