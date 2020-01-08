/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;

import format from "pg-format";

import { Transaction, Transactions } from "../../src/transactions";
import { TransactionsSchema } from "../../src/schema/transactions";

describe("postgres transactions repository", function() {
  let transactions: Transactions.PostgreSQLRepository;

  beforeEach(function() {
    transactions = new Transactions.PostgreSQLRepository(
      undefined,
      format,
      new TransactionsSchema()
    );
  });

  it("renders the find-by-id query", async function() {
    const result = transactions.findByIdQuery(1);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM transactions WHERE id = '1' LIMIT 1");
  });

  it("renders the save query with an emtpy account ids", async function() {
    const transaction: Transaction = {
      id: 209864836,
      accountId: 995070,
      amount: -89.81,
      bookingDate: new Date("2019-11-11T19:31:50+02:00"),
      purpose: " RE. 745259",
      counterPartName: "TueV Bayern",
      counterPartAccountNumber: "611105",
      counterPartIban: "DE13700800000061110500",
      counterPartBlz: "70080000",
      counterPartBic: "DRESDEFF700",
      counterPartBankName: "Commerzbank vormals Dresdner Bank"
    };

    const result = transactions.saveQuery(transaction);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO transactions (id,accountid,amount,bookingdate,purpose,counterpartname,counterpartaccountnumber,counterpartiban,counterpartblz,counterpartbic,counterpartbankname) VALUES ('209864836','995070','-89.81','2019-11-11T17:31:50.000Z',' RE. 745259','TueV Bayern','611105','DE13700800000061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank')"
    );
  });

  it("renders the delete all query", async function() {
    const result = transactions.deleteAllQuery();
    expect(result).to.be.a("string");
    expect(result).to.equal("DELETE FROM transactions");
  });

  it("renders the save array query", async function() {
    let transactionsData: Transaction[] = [
      {
        id: 1112,
        accountId: 2,
        amount: -89.871,
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
        amount: -99.81,
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

    const result = transactions.saveArrayQuery(transactionsData);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO transactions (id,accountid,amount,bookingdate,purpose,counterpartname,counterpartaccountnumber,counterpartiban,counterpartblz,counterpartbic,counterpartbankname) VALUES ('1112','2','-89.871','2018-01-01T00:00:00.000Z',' RE. 745259','TueV Bayern','611105','DE13700800000061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank'), ('2233','2','-99.81','2018-01-01T00:00:00.000Z',' RE. 745259','TueV Bayern','611105','DE13700800000061110500','70080000','DRESDEFF700','Commerzbank vormals Dresdner Bank')"
    );
  });

  it("renders the find-by-account-id query", async function() {
    const result = transactions.findByAccountIdsQuery([2, 5]);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM transactions WHERE accountid in ('2','5')");
  });
});
