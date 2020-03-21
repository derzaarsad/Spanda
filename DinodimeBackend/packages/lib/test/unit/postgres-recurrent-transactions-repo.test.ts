/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;

import format from "pg-format";

import { RecurrentTransaction, RecurrentTransactions } from "../../src/recurrent-transactions";
import { RecurrentTransactionsSchema } from "../../src/schema/recurrent-transactions";

describe("postgres recurrent transactions repository", function() {
  let recurrentTransactions: RecurrentTransactions.PostgreSQLRepository;

  beforeEach(function() {
    recurrentTransactions = new RecurrentTransactions.PostgreSQLRepository(
      undefined,
      format,
      new RecurrentTransactionsSchema()
    );
  });

  it("renders the find-by-id query", async function() {
    const result = recurrentTransactions.findByIdQuery(1);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM recurrenttransactions WHERE id = '1' LIMIT 1");
  });

  it("renders the find-by-ids query", async function() {
    const result = recurrentTransactions.findByIdsQuery([1,2,3]);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM recurrenttransactions WHERE id in ('1','2','3')");
  });

  it("renders the save query with an id", async function() {
    const recurrentTransaction = new RecurrentTransaction(995070, [1,2,3], true, 'Dinodime GmbH', 209864836);

    const result = recurrentTransactions.saveQuery(recurrentTransaction);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO recurrenttransactions (id,accountid,transactionids,isexpense,isconfirmed,frequency,counterpartname) VALUES ('209864836','995070','{1,2,3}','t','f','Unknown','Dinodime GmbH')"
    );
  });

  it("renders the save without an id", async function() {
    const recurrentTransaction = new RecurrentTransaction(995070, [1,2,3], true, null);

    const result = recurrentTransactions.saveWithoutIdQuery(recurrentTransaction);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO recurrenttransactions (accountid,transactionids,isexpense,isconfirmed,frequency,counterpartname) VALUES ('995070','{1,2,3}','t','f','Unknown',NULL)"
    );
  });

  it("renders the delete all query", async function() {
    const result = recurrentTransactions.deleteAllQuery();
    expect(result).to.be.a("string");
    expect(result).to.equal("DELETE FROM recurrenttransactions");
  });

  it("renders the save array query", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(2,[1,2,3],true,null,1112),
        new RecurrentTransaction(2,[4,5,6],false,null,2233)
    ];

    const result = recurrentTransactions.saveArrayQuery(recurrentTransactionsData);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO recurrenttransactions (id,accountid,transactionids,isexpense,isconfirmed,frequency,counterpartname) VALUES ('1112','2','{1,2,3}','true','false','Unknown',NULL), ('2233','2','{4,5,6}','false','false','Unknown',NULL)"
    );
  });

  it("renders the save array without id query", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(2,[1,2,3],true,null),
        new RecurrentTransaction(2,[4,5,6],false,null)
    ];

    const result = recurrentTransactions.saveArrayWithoutIdQuery(recurrentTransactionsData);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO recurrenttransactions (accountid,transactionids,isexpense,isconfirmed,frequency,counterpartname) VALUES ('2','{1,2,3}','true','false','Unknown',NULL), ('2','{4,5,6}','false','false','Unknown',NULL)"
    );
  });

  it("renders the update array query", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(2,[1,2,3],true,null,1112),
        new RecurrentTransaction(2,[4,5,6],false,null,2233)
    ];

    const result = recurrentTransactions.updateArrayQuery(recurrentTransactionsData);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "UPDATE INTO recurrenttransactions (id,accountid,transactionids,isexpense,isconfirmed,frequency,counterpartname) VALUES ('1112','2','{1,2,3}','true','false','Unknown',NULL), ('2233','2','{4,5,6}','false','false','Unknown',NULL)"
    );
  });

  it("renders the find-by-account-id query", async function() {
    const result = recurrentTransactions.findByAccountIdsQuery([2, 5]);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM recurrenttransactions WHERE accountid in ('2','5')");
  });

  it("renders the group-by-column query", async function() {
    const result = recurrentTransactions.groupByColumnQuery(2,3);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT ( SELECT array_to_json(array_agg(t)) from (SELECT * FROM recurrenttransactions WHERE isexpense=b.isexpense AND accountid='2') t ) rw FROM recurrenttransactions b WHERE isexpense IS NOT NULL GROUP BY isexpense");
  });
});
