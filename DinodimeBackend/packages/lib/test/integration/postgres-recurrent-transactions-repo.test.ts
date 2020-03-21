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

  it("saves and retrieves a recurrent transaction", async function() {
    const recurrentTransaction = new RecurrentTransaction(995070, [1,2,3], true, null, 209864836);
    await recurrentTransactions.save(recurrentTransaction);

    const result = await recurrentTransactions.findById(209864836);
    expect(result).to.be.not.null;
    expect(result!.id).to.eql(recurrentTransaction.id);
    expect(result!.accountId).to.eql(recurrentTransaction.accountId);
    expect(result!.transactionIds).to.eql(recurrentTransaction.transactionIds);
    expect(result!.isExpense).to.eql(recurrentTransaction.isExpense);
    expect(result!.isConfirmed).to.eql(recurrentTransaction.isConfirmed);
    expect(TransactionFrequency[result!.frequency]).to.eql(recurrentTransaction.frequency); // I don't feel right about this because I expect enum to equal enum
    expect(result!.counterPartName).to.be.null;
  });

  it("find by ids", async function() {
    await recurrentTransactions.save(new RecurrentTransaction(69, [1,2,3], true, null, 22));
    await recurrentTransactions.save(new RecurrentTransaction(70, [1,2,3], true, null, 23));
    await recurrentTransactions.save(new RecurrentTransaction(71, [1,2,3], true, null, 24));

    const result = await recurrentTransactions.findByIds([22,23,24]);
    expect(result.length).to.equal(3);
    expect(result[0].id).to.equal(22);
    expect(result[1].id).to.equal(23);
    expect(result[2].id).to.equal(24);

    expect(result[0].accountId).to.equal(69);
    expect(result[1].accountId).to.equal(70);
    expect(result[2].accountId).to.equal(71);
  });

  it("saves and retrieves a recurrent transaction without id", async function() {
    const recurrentTransaction = new RecurrentTransaction(995070, [1,2,3], true, "Dinodime GmbH");
    await recurrentTransactions.saveWithoutId(recurrentTransaction);

    const result = await recurrentTransactions.findById(1);
    expect(result).to.be.not.null;
    expect(result!.id).to.eql(1);
    expect(result!.accountId).to.eql(recurrentTransaction.accountId);
    expect(result!.transactionIds).to.eql(recurrentTransaction.transactionIds);
    expect(result!.isExpense).to.eql(recurrentTransaction.isExpense);
    expect(result!.isConfirmed).to.eql(recurrentTransaction.isConfirmed);
    expect(TransactionFrequency[result!.frequency]).to.eql(recurrentTransaction.frequency); // I don't feel right about this because I expect enum to equal enum
    expect(result!.counterPartName).to.eql("Dinodime GmbH")

    const recurrentTransaction2 = new RecurrentTransaction(885070, [4,5,6], false, "Dinodime GmbH");
    await recurrentTransactions.saveWithoutId(recurrentTransaction2);

    const result2 = await recurrentTransactions.findById(2);
    expect(result2).to.be.not.null;
    expect(result2!.id).to.eql(2);
    expect(result2!.accountId).to.eql(recurrentTransaction2.accountId);
    expect(result2!.transactionIds).to.eql(recurrentTransaction2.transactionIds);
    expect(result2!.isExpense).to.eql(recurrentTransaction2.isExpense);
    expect(result2!.isConfirmed).to.eql(recurrentTransaction2.isConfirmed);
    expect(TransactionFrequency[result2!.frequency]).to.eql(recurrentTransaction2.frequency); // I don't feel right about this because I expect enum to equal enum
    expect(result2!.counterPartName).to.eql("Dinodime GmbH")
  });

  it("save with unique id and account id", async function() {
    const firstRecurrentTransaction = new RecurrentTransaction(1, [1,2,3], true, null, 1);
    await recurrentTransactions.save(firstRecurrentTransaction);

    const secondRecurrentTransaction = new RecurrentTransaction(2, [4,5,6], true, null, 1);
    await expect(recurrentTransactions.save(secondRecurrentTransaction)).to.eventually.be.fulfilled;

    const thirdRecurrentTransaction = new RecurrentTransaction(1, [7,8,9], true, null, 2);
    await expect(recurrentTransactions.save(thirdRecurrentTransaction)).to.eventually.be.fulfilled;

    const fourthRecurrentTransaction = new RecurrentTransaction(1, [10,11,12], true, null, 1);
    await expect(recurrentTransactions.save(fourthRecurrentTransaction)).to.eventually.be.rejectedWith(
      'duplicate key value violates unique constraint "recurrenttransactions_pkey"'
    );
  });

  it("save multiple recurrent transactions with different id", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(2, [1,2,3], true, null, 1112),
        new RecurrentTransaction(2, [4,5,6], true, null, 2233),
        new RecurrentTransaction(5, [7,8,9], true, null, 4112)
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
    expect(result!.counterPartName).to.be.null;

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

  it("save multiple recurrent transactions with different account id", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(5, [1,2,3], true, "Dinodime GmbH", 1112),
        new RecurrentTransaction(2, [4,5,6], true, null, 1112)
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
    expect(result!.counterPartName).to.eql("Dinodime GmbH");

    // If the array contains at least one object with the same ids,
    // save is rejected and the other objects are not saved
    let recurrentTransactionsData2: RecurrentTransaction[] = [
      new RecurrentTransaction(5, [1,2,3], true, "Dinodime GmbH", 1112),
      new RecurrentTransaction(1, [4,5,6], true, null, 1111)
    ];
    await expect(recurrentTransactions.saveArray(recurrentTransactionsData2)).to.eventually.be.rejectedWith(
      'duplicate key value violates unique constraint "recurrenttransactions_pkey"'
    );
    const resultNotExist = await recurrentTransactions.findById(1111);
    expect(resultNotExist).to.be.null;
  });

  it("save multiple recurrent transactions with same id and account id", async function() {
    /*
     * If save fails, everything is not saved
     */
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(2, [1,2,3], true, null, 1112),
        new RecurrentTransaction(2, [4,5,6], true, null, 1112),
        new RecurrentTransaction(4, [7,8,9], true, null, 4112)
    ];

    await expect(recurrentTransactions.saveArray(recurrentTransactionsData)).to.eventually.be.rejectedWith(
      'duplicate key value violates unique constraint "recurrenttransactions_pkey"'
    );
    expect(await recurrentTransactions.findById(recurrentTransactionsData[0].id)).to.not.exist;
    expect(await recurrentTransactions.findById(recurrentTransactionsData[1].id)).to.not.exist;
    expect(await recurrentTransactions.findById(recurrentTransactionsData[2].id)).to.not.exist;
  });

  it("update multiple recurrent transactions", async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(5, [1,2,3], true, "Dinodime GmbH", 1113),
        new RecurrentTransaction(2, [4,5,6], true, null, 1112)
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
    expect(result!.counterPartName).to.eql("Dinodime GmbH");

    // Update only modifies existing objects
    let modifiedRecurrentTransaction = recurrentTransactionsData[0];
    modifiedRecurrentTransaction.counterPartName = "Modified Dinodime GmbH";
    modifiedRecurrentTransaction.isConfirmed = true;
    let recurrentTransactionsData2: RecurrentTransaction[] = [
      modifiedRecurrentTransaction,
      new RecurrentTransaction(2, [4,5,6], true, null, 1111)
    ];
    await recurrentTransactions.updateArray(recurrentTransactionsData2);
    const modifiedResults = await recurrentTransactions.findByAccountIds([2, 5]);
    expect(modifiedResults.length).to.eql(2);
    expect(modifiedResults[0].id).to.eql(1113);
    expect(modifiedResults[1].id).to.eql(1112);

    // Only isConfirmed can be updated
    expect(modifiedResults[1].counterPartName).to.eql("Dinodime GmbH");
    expect(modifiedResults[1].isConfirmed).to.eql(true);
  });

  it('group by isExpense column', async function() {
    let recurrentTransactionsData: RecurrentTransaction[] = [
        new RecurrentTransaction(2, [1,2,3], true, null),
        new RecurrentTransaction(2, [4,5,6], false, null),
        new RecurrentTransaction(2, [7,8,9], true, null),
        new RecurrentTransaction(2, [10,11,12], false, null),
        new RecurrentTransaction(3, [10,11,12], false, null)
    ];

    await recurrentTransactions.saveArrayWithoutId(recurrentTransactionsData);
    const recurrentTransactionsGroup = await recurrentTransactions.groupByIsExpense(2);
    expect(recurrentTransactionsGroup.length).to.equal(2);
    expect(recurrentTransactionsGroup[0].length).to.equal(2);
    expect(recurrentTransactionsGroup[0][0].accountId).to.equal(2);
    expect(recurrentTransactionsGroup[0][0].isExpense).to.equal(false);
    expect(recurrentTransactionsGroup[0][0].transactionIds).to.eql([4,5,6]);
    expect(recurrentTransactionsGroup[0][1].accountId).to.equal(2);
    expect(recurrentTransactionsGroup[0][1].isExpense).to.equal(false);
    expect(recurrentTransactionsGroup[0][1].transactionIds).to.eql([10,11,12]);
    expect(recurrentTransactionsGroup[1].length).to.equal(2);
    expect(recurrentTransactionsGroup[1][0].accountId).to.equal(2);
    expect(recurrentTransactionsGroup[1][0].isExpense).to.equal(true);
    expect(recurrentTransactionsGroup[1][0].transactionIds).to.eql([1,2,3]);
    expect(recurrentTransactionsGroup[1][1].accountId).to.equal(2);
    expect(recurrentTransactionsGroup[1][1].isExpense).to.equal(true);
    expect(recurrentTransactionsGroup[1][1].transactionIds).to.eql([7,8,9]);
  });
});
