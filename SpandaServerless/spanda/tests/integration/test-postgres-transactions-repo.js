/* MIGRATED */
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
      transactions.new(1112, 2, -89.871, new Date('2018-01-01T00:00:00.000Z'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank'),
      transactions.new(2233, 2, -99.81, new Date('2018-01-02T01:02:03.000Z'), ' RE. 745459', 'TueV Bayern', '611605', 'DE13700800001061110500', '70080070', 'DREEDEFF700', 'Commerzbank vormals Dresdner Bank'),
      transactions.new(4112, 5, -89.871, new Date('2018-01-01T00:00:00.000Z'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank')
    ];

    await transactions.saveArray(transactionsData);
    const result = await transactions.findById(transactionsData[1].id);
    expect(result.id).to.equal(transactionsData[1].id)
    expect(result.accountId).to.equal(transactionsData[1].accountId)
    expect(result.absAmount).to.equal(transactionsData[1].absAmount)
    expect(result.isExpense).to.equal(transactionsData[1].isExpense)
    expect(result.bookingDate.getTime()).to.equal(transactionsData[1].bookingDate.getTime())
    expect(result.purpose).to.equal(transactionsData[1].purpose)
    expect(result.counterPartName).to.equal(transactionsData[1].counterPartName)
    expect(result.counterPartAccountNumber).to.equal(transactionsData[1].counterPartAccountNumber)
    expect(result.counterPartIban).to.equal(transactionsData[1].counterPartIban)
    expect(result.counterPartBlz).to.equal(transactionsData[1].counterPartBlz)
    expect(result.counterPartBic).to.equal(transactionsData[1].counterPartBic)
    expect(result.counterPartBankName).to.equal(transactionsData[1].counterPartBankName)

    const results = await transactions.findByAccountIds([2]);
    expect(results.length).to.equal(2);

    const results2 = await transactions.findByAccountIds([2,5]);
    expect(results2.length).to.equal(3);
    expect(results2[0].id).to.equal(transactionsData[0].id);
    expect(results2[1].id).to.equal(transactionsData[1].id);
    expect(results2[2].id).to.equal(transactionsData[2].id);
    expect(results2[0].accountId).to.equal(2);
    expect(results2[1].accountId).to.equal(2);
    expect(results2[2].accountId).to.equal(5);
  })

  it('save multiple transactions with different account id', async function() {
    let transactionsData = [
      transactions.new(1112, 5, -89.871, new Date('2018-01-01T00:00:00.000Z'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank'),
      transactions.new(1112, 2, -99.81, new Date('2018-01-02T00:00:00.000Z'), ' RE. 745459', 'TueV Bayern', '611605', 'DE13700800001061110500', '70080070', 'DREEDEFF700', 'Commerzbank vormals Dresdner Bank')
    ];

    await transactions.saveArray(transactionsData);
    const result = await transactions.findById(transactionsData[0].id); // on purpose to put index zero
    expect(result.id).to.equal(transactionsData[1].id)
    expect(result.accountId).to.equal(transactionsData[1].accountId)
    expect(result.absAmount).to.equal(transactionsData[1].absAmount)
    expect(result.isExpense).to.equal(transactionsData[1].isExpense)
    expect(result.bookingDate.getTime()).to.equal(new Date(transactionsData[1].bookingDate).getTime())
    expect(result.purpose).to.equal(transactionsData[1].purpose)
    expect(result.counterPartName).to.equal(transactionsData[1].counterPartName)
    expect(result.counterPartAccountNumber).to.equal(transactionsData[1].counterPartAccountNumber)
    expect(result.counterPartIban).to.equal(transactionsData[1].counterPartIban)
    expect(result.counterPartBlz).to.equal(transactionsData[1].counterPartBlz)
    expect(result.counterPartBic).to.equal(transactionsData[1].counterPartBic)
    expect(result.counterPartBankName).to.equal(transactionsData[1].counterPartBankName)
  })

  it('save multiple transactions with same id and account id', async function() {
    /*
     * If save fails, everything is not saved
     */
    let transactionsData = [
      transactions.new(1112, 2, -89.871, new Date('2018-01-01T00:00:00.000Z'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank'),
      transactions.new(1112, 2, -99.81, new Date('2018-01-02T00:00:00.000Z'), ' RE. 745459', 'TueV Bayern', '611605', 'DE13700800001061110500', '70080070', 'DREEDEFF700', 'Commerzbank vormals Dresdner Bank'),
      transactions.new(4112, 4, -69.81, new Date('2018-01-03T00:00:00.000Z'), ' RE. 735459', 'TueV Bayern', '631605', 'DE13700807001061110500', '71080070', 'DREEUEFF700', 'Commerzbank vormals Dresdner Bank')
    ];

    await expect(transactions.saveArray(transactionsData)).to.eventually.be.rejectedWith('duplicate key value violates unique constraint "transactions_pkey"');
    expect(await transactions.findById(transactionsData[0].id)).to.not.exist
    expect(await transactions.findById(transactionsData[1].id)).to.not.exist
    expect(await transactions.findById(transactionsData[2].id)).to.not.exist
  })

  it('group by iban column', async function() {
    let transactionsData = [
      transactions.new(1112,2,-89.871,new Date('2018-01-01T00:00:00.000Z'),' RE. 745259','TueV Bayern','611105','AU13700807001061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank'),
      transactions.new(1112,3,-99.81,new Date('2018-01-02T00:00:00.000Z'),' RE. 745459','TueV Bayern','611605','AU13700807001061110500','70080070','DREEDEFF700','Commerzbank vormals Dresdner Bank'),
      transactions.new(4112,4,-64.81,new Date('2018-01-03T00:00:00.000Z'),' RE. 735459','TueV Bayern','631605','DE13700800000061110500','71080070','DREEUEFF700','Commerzbank vormals Dresdner Bank'),
      transactions.new(4112,5,-69.81,new Date('2018-01-03T00:00:00.000Z'),' RE. 735459','TueV Bayern','631605','DE13700800000061110500','71080070','DREEUEFF700','Commerzbank vormals Dresdner Bank')
    ];

    await transactions.saveArray(transactionsData);
    const transactionsGroup = await transactions.groupByIban();
    expect(transactionsGroup.length).to.equal(2);
    expect(transactionsGroup[0][0].accountId).to.equal(2);
    expect(transactionsGroup[0][0].counterPartIban).to.equal('AU13700807001061110500');
    expect(transactionsGroup[0][1].accountId).to.equal(3);
    expect(transactionsGroup[0][1].counterPartIban).to.equal('AU13700807001061110500');
    expect(transactionsGroup[1][0].accountId).to.equal(4);
    expect(transactionsGroup[1][0].counterPartIban).to.equal('DE13700800000061110500');
    expect(transactionsGroup[1][1].accountId).to.equal(5);
    expect(transactionsGroup[1][1].counterPartIban).to.equal('DE13700800000061110500');
  })
})

