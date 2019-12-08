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
})

