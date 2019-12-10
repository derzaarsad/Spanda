'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const expect = chai.expect;

const format = require('pg-format');
const { Pool } = require('pg');

const transactionsSchema = require('../../lib/schema/transactions');
const types = require('../../lib/schema/types');

const Transactions = require('../../lib/transactions');

describe('postgres transactions repository', function() {
  let transactions

  before(function() {
    transactions = Transactions.NewPostgreSQLRepository(new Pool(), format, transactionsSchema, types);
  })

  beforeEach(async function() {
    await transactions.deleteAll();
  })

  it('returns null when transaction not found', async function() {
    const result = await transactions.findById(1);
    expect(result).to.be.null;
  })

  it('saves and retrieves a transaction', async function() {
    const transaction = transactions.new(209864836, 995070, -89.81, new Date('2019-11-11T19:31:50.379+00:00'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank');
    await transactions.save(transaction);

    const result = await transactions.findById(209864836);
    expect(result).to.eql(transaction);
  })

  it('save with unique id and account id', async function() {
    const firstTransaction = transactions.new(1, 1, -89.81, new Date('2019-11-11T19:31:50.379+00:00'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank');
    await transactions.save(firstTransaction);

    const secondTransaction = transactions.new(1, 2, -89.81, new Date('2019-11-11T19:31:50.379+00:00'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank');
    await expect(transactions.save(secondTransaction)).to.eventually.be.fulfilled;

    const thirdTransaction = transactions.new(2, 1, -89.81, new Date('2019-11-11T19:31:50.379+00:00'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank');
    await expect(transactions.save(thirdTransaction)).to.eventually.be.fulfilled;

    const fourthTransaction = transactions.new(1, 1, -89.81, new Date('2019-11-11T19:31:50.379+00:00'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank');
    await expect(transactions.save(fourthTransaction)).to.eventually.be.rejectedWith('duplicate key value violates unique constraint "transactions_pkey"');
  })

  it('save multiple transactions with different id', async function() {
    let transactionsData = [
      [1112,2,-89.871,'2018-01-01T00:00:00.000Z',' RE. 745259','TueV Bayern','611105','DE13700800000061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank'],
      [2233,2,-99.81,'2018-01-02T01:02:03.000Z',' RE. 745459','TueV Bayern','611605','DE13700800001061110500','70080070','DREEDEFF700','Commerzbank vormals Dresdner Bank']
    ];

    await transactions.saveArray(transactionsData);
    const result = await transactions.findById(transactionsData[1][0]);
    expect(result.id).to.equal(transactionsData[1][0])
    expect(result.accountId).to.equal(transactionsData[1][1])
    expect(result.amount).to.equal(transactionsData[1][2])
    expect(result.bookingDate.getTime()).to.equal(new Date(transactionsData[1][3]).getTime())
    expect(result.purpose).to.equal(transactionsData[1][4])
    expect(result.counterPartName).to.equal(transactionsData[1][5])
    expect(result.counterPartAccountNumber).to.equal(transactionsData[1][6])
    expect(result.counterPartIban).to.equal(transactionsData[1][7])
    expect(result.counterPartBlz).to.equal(transactionsData[1][8])
    expect(result.counterPartBic).to.equal(transactionsData[1][9])
    expect(result.counterPartBankName).to.equal(transactionsData[1][10])
  })

  it('save multiple transactions with different account id', async function() {
    let transactionsData = [
      [1112,5,-89.871,'2018-01-01T00:00:00.000Z',' RE. 745259','TueV Bayern','611105','DE13700800000061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank'],
      [1112,2,-99.81,'2018-01-02T00:00:00.000Z',' RE. 745459','TueV Bayern','611605','DE13700800001061110500','70080070','DREEDEFF700','Commerzbank vormals Dresdner Bank']
    ];

    await transactions.saveArray(transactionsData);
    const result = await transactions.findById(transactionsData[0][0]); // on purpose to put index zero
    expect(result.id).to.equal(transactionsData[1][0])
    expect(result.accountId).to.equal(transactionsData[1][1])
    expect(result.amount).to.equal(transactionsData[1][2])
    expect(result.bookingDate.getTime()).to.equal(new Date(transactionsData[1][3]).getTime())
    expect(result.purpose).to.equal(transactionsData[1][4])
    expect(result.counterPartName).to.equal(transactionsData[1][5])
    expect(result.counterPartAccountNumber).to.equal(transactionsData[1][6])
    expect(result.counterPartIban).to.equal(transactionsData[1][7])
    expect(result.counterPartBlz).to.equal(transactionsData[1][8])
    expect(result.counterPartBic).to.equal(transactionsData[1][9])
    expect(result.counterPartBankName).to.equal(transactionsData[1][10])
  })

  it('save multiple transactions with same id and account id', async function() {
    /*
     * If save fails, everything is not saved
     */
    let transactionsData = [
      [1112,2,-89.871,'2018-01-01T00:00:00.000Z',' RE. 745259','TueV Bayern','611105','DE13700800000061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank'],
      [1112,2,-99.81,'2018-01-02T00:00:00.000Z',' RE. 745459','TueV Bayern','611605','DE13700800001061110500','70080070','DREEDEFF700','Commerzbank vormals Dresdner Bank'],
      [4112,4,-69.81,'2018-01-03T00:00:00.000Z',' RE. 735459','TueV Bayern','631605','DE13700807001061110500','71080070','DREEUEFF700','Commerzbank vormals Dresdner Bank']
    ];

    await expect(transactions.saveArray(transactionsData)).to.eventually.be.rejectedWith('duplicate key value violates unique constraint "transactions_pkey"');
    expect(await transactions.findById(transactionsData[0][0])).to.not.exist
    expect(await transactions.findById(transactionsData[1][0])).to.not.exist
    expect(await transactions.findById(transactionsData[2][0])).to.not.exist
  })
})

