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

  it("renders the save query with an empty account ids", async function() {
    const recurrentTransaction = new RecurrentTransaction(209864836, 995070, [1,2,3], true);

    const result = recurrentTransactions.saveQuery(recurrentTransaction);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO recurrenttransactions (id,accountid,transactionids,isexpense,isconfirmed,frequency) VALUES ('209864836','995070','{1,2,3}','t','f','Unknown')"
    );
  });

  it("renders the delete all query", async function() {
    const result = recurrentTransactions.deleteAllQuery();
    expect(result).to.be.a("string");
    expect(result).to.equal("DELETE FROM recurrenttransactions");
  });

  it("renders the save array query", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(1112,2,[1,2,3],true),
        new RecurrentTransaction(2233,2,[4,5,6],false)
    ];

    const result = recurrentTransactions.saveArrayQuery(recurrentTransactionsData);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO recurrenttransactions (id,accountid,transactionids,isexpense,isconfirmed,frequency) VALUES ('1112','2','{1,2,3}','true','false','Unknown'), ('2233','2','{4,5,6}','false','false','Unknown')"
    );
  });

  it("renders the find-by-account-id query", async function() {
    const result = recurrentTransactions.findByAccountIdsQuery([2, 5]);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM recurrenttransactions WHERE accountid in ('2','5')");
  });

  it("renders the group-by-column query", async function() {
    const result = recurrentTransactions.groupByColumnQuery(3);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT ( SELECT array_to_json(array_agg(t)) from (SELECT * FROM recurrenttransactions WHERE isexpense=b.isexpense) t ) rw FROM recurrenttransactions b WHERE isexpense IS NOT NULL GROUP BY isexpense");
  });
});
