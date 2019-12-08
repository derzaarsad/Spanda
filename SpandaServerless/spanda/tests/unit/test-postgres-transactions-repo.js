'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const format = require('pg-format');

const Transactions = require('../../lib/transactions');
const transactionsSchema = require('../../lib/schema/transactions');

describe('postgres transactions repository', function() {
  let transactions

  beforeEach(function() {
    transactions = Transactions.NewPostgreSQLRepository(null, format, transactionsSchema);
  })

  it('renders the find-by-id query', async function() {
    const result = await transactions.findByIdQuery(1);
    expect(result).to.be.a('string');
    expect(result).to.equal("SELECT * FROM transactions WHERE id = '1' LIMIT 1");
  })

  it('renders the save query with an emtpy account ids', async function() {
    const transaction = transactions.new(209864836, 995070, -89.81, new Date('2019-11-11T19:31:50.379+00:00'), ' RE. 745259', 'TueV Bayern', '611105', 'DE13700800000061110500', '70080000', 'DRESDEFF700', 'Commerzbank vormals Dresdner Bank');

    const result = transactions.saveQuery(transaction);
    expect(result).to.be.a('string');
    expect(result).to.equal("INSERT INTO transactions (id,accountid,amount,bookingdate,purpose,counterpartname,counterpartaccountnumber,counterpartiban,counterpartblz,counterpartbic,counterpartbankname) VALUES ('209864836','995070','-89.81','2019-11-11 19:31:50.379+00',' RE. 745259','TueV Bayern','611105','DE13700800000061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank')");
  })

  it('renders the delete all query', async function() {
    const result = transactions.deleteAllQuery;
    expect(result).to.be.a('string');
    expect(result).to.equal("DELETE FROM transactions");
  })

  it('renders json array', async function() {
    let transactionsData = [
      {id:1112,accountid:2,amount:-89.871,bookingdate:'2018-01-01T00:00:00.000Z',purpose:' RE. 745259',counterpartname:'TueV Bayern',counterpartaccountnumber:'611105',counterpartiban:'DE13700800000061110500',counterpartblz:'70080000',counterpartbic:'DRESDEFF700',counterpartbankname:'Commerzbank vormals Dresdner Bank'},
      {id:2233,accountid:2,amount:-99.81,bookingdate:'2018-01-01T00:00:00.000Z',purpose:' RE. 745259',counterpartname:'TueV Bayern',counterpartaccountnumber:'611105',counterpartiban:'DE13700800000061110500',counterpartblz:'70080000',counterpartbic:'DRESDEFF700',counterpartbankname:'Commerzbank vormals Dresdner Bank'}
    ];

    const result = transactions.saveJsonArrayQuery(transactionsData);
    expect(result).to.be.a('string');
    expect(result).to.equal("INSERT INTO transactions (id,accountid,amount,bookingdate,purpose,counterpartname,counterpartaccountnumber,counterpartiban,counterpartblz,counterpartbic,counterpartbankname) SELECT * FROM json_populate_recordset(null::transactions, '[{\"id\":1112,\"accountid\":2,\"amount\":-89.871,\"bookingdate\":\"2018-01-01T00:00:00.000Z\",\"purpose\":\" RE. 745259\",\"counterpartname\":\"TueV Bayern\",\"counterpartaccountnumber\":\"611105\",\"counterpartiban\":\"DE13700800000061110500\",\"counterpartblz\":\"70080000\",\"counterpartbic\":\"DRESDEFF700\",\"counterpartbankname\":\"Commerzbank vormals Dresdner Bank\"},{\"id\":2233,\"accountid\":2,\"amount\":-99.81,\"bookingdate\":\"2018-01-01T00:00:00.000Z\",\"purpose\":\" RE. 745259\",\"counterpartname\":\"TueV Bayern\",\"counterpartaccountnumber\":\"611105\",\"counterpartiban\":\"DE13700800000061110500\",\"counterpartblz\":\"70080000\",\"counterpartbic\":\"DRESDEFF700\",\"counterpartbankname\":\"Commerzbank vormals Dresdner Bank\"}]\')");
  })
})
