/* eslint-env node, mocha */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const expect = chai.expect;
chai.use(chaiAsPromised);

import format from "pg-format";
import { Pool } from "pg";
import { RecurrentTransaction, RecurrentTransactions, TransactionFrequency } from "../../src/recurrent-transactions";
import { RecurrentTransactionsSchema } from "../../src/schema/recurrent-transactions";

describe("postgres recurrent transactions repository", function() {
  let recurrentTransactions: RecurrentTransactions.PostgreSQLRepository;

  before(function() {
    const schema = new RecurrentTransactionsSchema();
    recurrentTransactions = new RecurrentTransactions.PostgreSQLRepository(new Pool(), format, schema);
  });

  beforeEach(async function() {
    await recurrentTransactions.deleteAll();
  });

  it("returns null when transaction not found", async function() {
    const result = await recurrentTransactions.findById(1);
    expect(result).to.be.null;
  });

  it("saves and retrieves a transaction", async function() {
    const recurrentTransaction = new RecurrentTransaction(209864836, 995070, [1,2,3], true);
    await recurrentTransactions.save(recurrentTransaction);

    const result = await recurrentTransactions.findById(209864836);
    expect(result).to.be.not.null;
    expect(result!.id).to.eql(recurrentTransaction.id);
    expect(result!.accountId).to.eql(recurrentTransaction.accountId);
    expect(result!.transactionIds).to.eql(recurrentTransaction.transactionIds);
    expect(result!.isExpense).to.eql(recurrentTransaction.isExpense);
    expect(result!.isConfirmed).to.eql(recurrentTransaction.isConfirmed);
    expect(TransactionFrequency[result!.frequency]).to.eql(recurrentTransaction.frequency); // I don't feel right about this because I expect enum to equal enum
  });

  it("save with unique id and account id", async function() {
    const firstRecurrentTransaction = new RecurrentTransaction(1, 1, [1,2,3], true);
    await recurrentTransactions.save(firstRecurrentTransaction);

    const secondRecurrentTransaction = new RecurrentTransaction(1, 2, [4,5,6], true);
    await expect(recurrentTransactions.save(secondRecurrentTransaction)).to.eventually.be.fulfilled;

    const thirdRecurrentTransaction = new RecurrentTransaction(2, 1, [7,8,9], true);
    await expect(recurrentTransactions.save(thirdRecurrentTransaction)).to.eventually.be.fulfilled;

    const fourthRecurrentTransaction = new RecurrentTransaction(1, 1, [10,11,12], true);
    await expect(recurrentTransactions.save(fourthRecurrentTransaction)).to.eventually.be.rejectedWith(
      'duplicate key value violates unique constraint "recurrenttransactions_pkey"'
    );
  });

  it("save multiple transactions with different id", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(1112, 2, [1,2,3], true),
        new RecurrentTransaction(2233, 2, [4,5,6], true),
        new RecurrentTransaction(4112, 5, [7,8,9], true)
    ];

    await recurrentTransactions.saveArray(recurrentTransactionsData);
    const result = await recurrentTransactions.findById(recurrentTransactionsData[1].id);
    expect(result).to.be.not.null;
    expect(result!.id).to.eql(recurrentTransactionsData[1].id);
    expect(result!.accountId).to.eql(recurrentTransactionsData[1].accountId);
    expect(result!.transactionIds).to.eql(recurrentTransactionsData[1].transactionIds);
    expect(result!.isExpense).to.eql(recurrentTransactionsData[1].isExpense);
    expect(result!.isConfirmed).to.eql(recurrentTransactionsData[1].isConfirmed);
    expect(TransactionFrequency[result!.frequency]).to.eql(recurrentTransactionsData[1].frequency); // I don't feel right about this because I expect enum to equal enum

    const results = await recurrentTransactions.findByAccountIds([2]);
    expect(results.length).to.eql(2);

    const results2 = await recurrentTransactions.findByAccountIds([2, 5]);
    expect(results2.length).to.eql(3);
    expect(results2[0].id).to.eql(recurrentTransactionsData[0].id);
    expect(results2[1].id).to.eql(recurrentTransactionsData[1].id);
    expect(results2[2].id).to.eql(recurrentTransactionsData[2].id);
    expect(results2[0].accountId).to.eql(2);
    expect(results2[1].accountId).to.eql(2);
    expect(results2[2].accountId).to.eql(5);
  });

  it("save multiple transactions with different account id", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(1112, 5, [1,2,3], true),
        new RecurrentTransaction(1112, 2, [4,5,6], true)
    ];

    await recurrentTransactions.saveArray(recurrentTransactionsData);
    const result = await recurrentTransactions.findById(recurrentTransactionsData[1].id);
    expect(result).to.be.not.null;
    expect(result!.id).to.eql(recurrentTransactionsData[0].id);
    expect(result!.accountId).to.eql(recurrentTransactionsData[0].accountId);
    expect(result!.transactionIds).to.eql(recurrentTransactionsData[0].transactionIds);
    expect(result!.isExpense).to.eql(recurrentTransactionsData[0].isExpense);
    expect(result!.isConfirmed).to.eql(recurrentTransactionsData[0].isConfirmed);
    expect(TransactionFrequency[result!.frequency]).to.eql(recurrentTransactionsData[0].frequency); // I don't feel right about this because I expect enum to equal enum
  });

  it("save multiple transactions with same id and account id", async function() {
    /*
     * If save fails, everything is not saved
     */
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(1112, 2, [1,2,3], true),
        new RecurrentTransaction(1112, 2, [4,5,6], true),
        new RecurrentTransaction(4112, 4, [7,8,9], true)
    ];

    await expect(recurrentTransactions.saveArray(recurrentTransactionsData)).to.eventually.be.rejectedWith(
      'duplicate key value violates unique constraint "recurrenttransactions_pkey"'
    );
    expect(await recurrentTransactions.findById(recurrentTransactionsData[0].id)).to.not.exist;
    expect(await recurrentTransactions.findById(recurrentTransactionsData[1].id)).to.not.exist;
    expect(await recurrentTransactions.findById(recurrentTransactionsData[2].id)).to.not.exist;
  });

  it('group by isExpense column', async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(1112, 2, [1,2,3], true),
        new RecurrentTransaction(1112, 3, [4,5,6], false),
        new RecurrentTransaction(4112, 4, [7,8,9], true),
        new RecurrentTransaction(4112, 5, [10,11,12], false)
    ];

    await recurrentTransactions.saveArray(recurrentTransactionsData);
    const recurrentTransactionsGroup = await recurrentTransactions.groupByIsExpense();
    expect(recurrentTransactionsGroup.length).to.equal(2);
    expect(recurrentTransactionsGroup[0][0].accountId).to.equal(3);
    expect(recurrentTransactionsGroup[0][0].isExpense).to.equal(false);
    expect(recurrentTransactionsGroup[0][1].accountId).to.equal(5);
    expect(recurrentTransactionsGroup[0][1].isExpense).to.equal(false);
    expect(recurrentTransactionsGroup[1][0].accountId).to.equal(2);
    expect(recurrentTransactionsGroup[1][0].isExpense).to.equal(true);
    expect(recurrentTransactionsGroup[1][1].accountId).to.equal(4);
    expect(recurrentTransactionsGroup[1][1].isExpense).to.equal(true);
  });
});
