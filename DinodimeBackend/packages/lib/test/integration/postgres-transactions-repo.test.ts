/* eslint-env node, mocha */
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const expect = chai.expect;
chai.use(chaiAsPromised);

import format from "pg-format";
import { Pool } from "pg";
import { Transaction, Transactions } from "../../src/transactions";
import { TransactionsSchema } from "../../src/schema/transactions";

describe("postgres transactions repository", function() {
  let transactions: Transactions.PostgreSQLRepository;

  before(function() {
    const schema = new TransactionsSchema();
    transactions = new Transactions.PostgreSQLRepository(new Pool(), format, schema);
  });

  beforeEach(async function() {
    await transactions.deleteAll();
  });

  it("returns null when transaction not found", async function() {
    const result = await transactions.findById(1);
    expect(result).to.be.null;
  });

  it("saves and retrieves a transaction", async function() {
    const transaction = {
      id: 209864836,
      accountId: 995070,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };
    await transactions.save(transaction);

    const result = await transactions.findById(209864836);
    expect(result).to.eql(transaction);
  });

  it("find by ids", async function() {

    const transaction1 = {
      id: 22,
      accountId: 69,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };

    const transaction2 = {
      id: 23,
      accountId: 70,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };

    const transaction3 = {
      id: 24,
      accountId: 71,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };
    await transactions.save(transaction1);
    await transactions.save(transaction2);
    await transactions.save(transaction3);

    const result = await transactions.findByIds([22,23,24]);
    expect(result.length).to.equal(3);
    expect(result[0].id).to.equal(22);
    expect(result[1].id).to.equal(23);
    expect(result[2].id).to.equal(24);

    expect(result[0].accountId).to.equal(69);
    expect(result[1].accountId).to.equal(70);
    expect(result[2].accountId).to.equal(71);
  });

  it("save with unique id and account id", async function() {
    const firstTransaction = {
      id: 1,
      accountId: 1,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };
    await transactions.save(firstTransaction);

    const secondTransaction = {
      id: 1,
      accountId: 2,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };
    await expect(transactions.save(secondTransaction)).to.eventually.be.fulfilled;

    const thirdTransaction = {
      id: 2,
      accountId: 1,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };
    await expect(transactions.save(thirdTransaction)).to.eventually.be.fulfilled;

    const fourthTransaction = {
      id: 1,
      accountId: 1,
      absAmount: 89.81,
      isExpense: true,
      bookingDate: new Date("2019-11-11T19:31:50.379+00:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };
    await expect(transactions.save(fourthTransaction)).to.eventually.be.rejectedWith(
      'duplicate key value violates unique constraint "transactions_pkey"'
    );
  });

  it("save multiple transactions with different id", async function() {
    let transactionsData: Transaction[] = [
      {
        id: 1112,
        accountId: 2,
        absAmount: 89.871,
        isExpense: true,
        bookingDate: new Date("2018-01-01T00:00:00.000Z"),
        purpose: " RE. 745259",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611105",
        counterPartIban: "DE13700800000061110500",
        counterPartBlz: "70080000",
        counterPartBic: "DRESDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 2233,
        accountId: 2,
        absAmount: 99.81,
        isExpense: true,
        bookingDate: new Date("2018-01-02T01:02:03.000Z"),
        purpose: " RE. 745459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611605",
        counterPartIban: "DE13700800001061110500",
        counterPartBlz: "70080070",
        counterPartBic: "DREEDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 4112,
        accountId: 5,
        absAmount: 89.871,
        isExpense: true,
        bookingDate: new Date("2018-01-01T00:00:00.000Z"),
        purpose: " RE. 745259",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611105",
        counterPartIban: "DE13700800000061110500",
        counterPartBlz: "70080000",
        counterPartBic: "DRESDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      }
    ];

    await transactions.saveArray(transactionsData);
    const result = await transactions.findById(transactionsData[1].id);
    expect(result).to.be.not.null;
    expect(result!.id).to.equal(transactionsData[1].id);
    expect(result!.accountId).to.equal(transactionsData[1].accountId);
    expect(result!.absAmount).to.equal(transactionsData[1].absAmount);
    expect(result!.isExpense).to.equal(transactionsData[1].isExpense);
    expect(result!.bookingDate.getTime()).to.equal(
      new Date(transactionsData[1].bookingDate).getTime()
    );
    expect(result!.purpose).to.equal(transactionsData[1].purpose);
    expect(result!.counterPartName).to.equal(transactionsData[1].counterPartName);
    expect(result!.counterPartAccountNumber).to.equal(transactionsData[1].counterPartAccountNumber);
    expect(result!.counterPartIban).to.equal(transactionsData[1].counterPartIban);
    expect(result!.counterPartBlz).to.equal(transactionsData[1].counterPartBlz);
    expect(result!.counterPartBic).to.equal(transactionsData[1].counterPartBic);
    expect(result!.counterPartBankName).to.equal(transactionsData[1].counterPartBankName);

    const results = await transactions.findByAccountIds([2]);
    expect(results.length).to.equal(2);

    const results2 = await transactions.findByAccountIds([2, 5]);
    expect(results2.length).to.equal(3);
    expect(results2[0].id).to.equal(transactionsData[0].id);
    expect(results2[1].id).to.equal(transactionsData[1].id);
    expect(results2[2].id).to.equal(transactionsData[2].id);
    expect(results2[0].accountId).to.equal(2);
    expect(results2[1].accountId).to.equal(2);
    expect(results2[2].accountId).to.equal(5);
  });

  it("save multiple transactions with different account id", async function() {
    let transactionsData: Transaction[] = [
      {
        id: 1112,
        accountId: 5,
        absAmount: 89.871,
        isExpense: true,
        bookingDate: new Date("2018-01-01T00:00:00.000Z"),
        purpose: " RE. 745259",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611105",
        counterPartIban: "DE13700800000061110500",
        counterPartBlz: "70080000",
        counterPartBic: "DRESDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 1112,
        accountId: 2,
        absAmount: 99.81,
        isExpense: true,
        bookingDate: new Date("2018-01-02T00:00:00.000Z"),
        purpose: " RE. 745459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611605",
        counterPartIban: "DE13700800001061110500",
        counterPartBlz: "70080070",
        counterPartBic: "DREEDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      }
    ];

    await transactions.saveArray(transactionsData);
    const result = await transactions.findById(transactionsData[0].id);
    expect(result).to.be.not.null;
    expect(result!.id).to.equal(transactionsData[1].id);
    expect(result!.accountId).to.equal(transactionsData[1].accountId);
    expect(result!.absAmount).to.equal(transactionsData[1].absAmount);
    expect(result!.isExpense).to.equal(transactionsData[1].isExpense);
    expect(result!.bookingDate.getTime()).to.equal(
      new Date(transactionsData[1].bookingDate).getTime()
    );
    expect(result!.purpose).to.equal(transactionsData[1].purpose);
    expect(result!.counterPartName).to.equal(transactionsData[1].counterPartName);
    expect(result!.counterPartAccountNumber).to.equal(transactionsData[1].counterPartAccountNumber);
    expect(result!.counterPartIban).to.equal(transactionsData[1].counterPartIban);
    expect(result!.counterPartBlz).to.equal(transactionsData[1].counterPartBlz);
    expect(result!.counterPartBic).to.equal(transactionsData[1].counterPartBic);
    expect(result!.counterPartBankName).to.equal(transactionsData[1].counterPartBankName);
  });

  it("save multiple transactions with same id and account id", async function() {
    /*
     * If save fails, everything is not saved
     */
    let transactionsData: Transaction[] = [
      {
        id: 1112,
        accountId: 2,
        absAmount: 89.871,
        isExpense: true,
        bookingDate: new Date("2018-01-01T00:00:00.000Z"),
        purpose: " RE. 745259",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611105",
        counterPartIban: "DE13700800000061110500",
        counterPartBlz: "70080000",
        counterPartBic: "DRESDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 1112,
        accountId: 2,
        absAmount: 99.81,
        isExpense: true,
        bookingDate: new Date("2018-01-02T00:00:00.000Z"),
        purpose: " RE. 745459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611605",
        counterPartIban: "DE13700800001061110500",
        counterPartBlz: "70080070",
        counterPartBic: "DREEDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 4112,
        accountId: 4,
        absAmount: 69.81,
        isExpense: true,
        bookingDate: new Date("2018-01-03T00:00:00.000Z"),
        purpose: " RE. 735459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "631605",
        counterPartIban: "DE13700807001061110500",
        counterPartBlz: "71080070",
        counterPartBic: "DREEUEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      }
    ];

    await expect(transactions.saveArray(transactionsData)).to.eventually.be.rejectedWith(
      'duplicate key value violates unique constraint "transactions_pkey"'
    );
    expect(await transactions.findById(transactionsData[0].id)).to.not.exist;
    expect(await transactions.findById(transactionsData[1].id)).to.not.exist;
    expect(await transactions.findById(transactionsData[2].id)).to.not.exist;
  });

  it('group by iban column', async function() {
    let transactionsData: Transaction[] = [
      {
        id: 1112,
        accountId: 2,
        absAmount: 89.871,
        isExpense: true,
        bookingDate: new Date("2018-01-01T00:00:00.000Z"),
        purpose: " RE. 745259",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611105",
        counterPartIban: "AU13700807001061110500",
        counterPartBlz: "70080000",
        counterPartBic: "DRESDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 1113,
        accountId: 2,
        absAmount: 99.81,
        isExpense: true,
        bookingDate: new Date("2018-01-02T00:00:00.000Z"),
        purpose: " RE. 745459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "611605",
        counterPartIban: "AU13700807001061110500",
        counterPartBlz: "70080070",
        counterPartBic: "DREEDEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 4112,
        accountId: 2,
        absAmount: 64.81,
        isExpense: true,
        bookingDate: new Date("2018-01-03T00:00:00.000Z"),
        purpose: " RE. 735459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "631605",
        counterPartIban: "DE13700800000061110500",
        counterPartBlz: "71080070",
        counterPartBic: "DREEUEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 4113,
        accountId: 2,
        absAmount: 69.81,
        isExpense: true,
        bookingDate: new Date("2018-01-03T00:00:00.000Z"),
        purpose: " RE. 735459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "631605",
        counterPartIban: "DE13700800000061110500",
        counterPartBlz: "71080070",
        counterPartBic: "DREEUEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      },
      {
        id: 4113,
        accountId: 3,
        absAmount: 69.81,
        isExpense: true,
        bookingDate: new Date("2018-01-03T00:00:00.000Z"),
        purpose: " RE. 735459",
        counterPartName: "TueV Bayern",
        counterPartAccountNumber: "631605",
        counterPartIban: "DE13700800000061110500",
        counterPartBlz: "71080070",
        counterPartBic: "DREEUEFF700",
        counterPartBankName: "Commerzbank vormals Dresdner Bank"
      }
    ];

    await transactions.saveArray(transactionsData);
    const transactionsGroup = await transactions.groupByIban(2);
    expect(transactionsGroup.length).to.equal(2);
    expect(transactionsGroup[0].length).to.equal(2);
    expect(transactionsGroup[0][0].accountId).to.equal(2);
    expect(transactionsGroup[0][0].counterPartIban).to.equal('AU13700807001061110500');
    expect(transactionsGroup[0][1].accountId).to.equal(2);
    expect(transactionsGroup[0][1].counterPartIban).to.equal('AU13700807001061110500');
    expect(transactionsGroup[1].length).to.equal(2);
    expect(transactionsGroup[1][0].accountId).to.equal(2);
    expect(transactionsGroup[1][0].counterPartIban).to.equal('DE13700800000061110500');
    expect(transactionsGroup[1][1].accountId).to.equal(2);
    expect(transactionsGroup[1][1].counterPartIban).to.equal('DE13700800000061110500');
  });
});
