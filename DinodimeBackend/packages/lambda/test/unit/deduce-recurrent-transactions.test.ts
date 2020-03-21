/* eslint-env node, mocha */
import winston from "winston";
import chai from "chai";
const expect = chai.expect;

import { deduceRecurrentTransactions } from "../../src/controllers/bank-controller";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport } from "dinodime-lib";
import { RecurrentTransactions, Transactions } from "dinodime-lib";
import { Transaction } from "dinodime-lib";
import { TransactionFrequency } from "dinodime-lib";

describe("deduce recurrent transactions", function() {
  let logger: winston.Logger;
  let recurrentTransactions: RecurrentTransactions.RecurrentTransactionsRepository;
  let transactions: Transactions.TransactionsRepository;

  beforeEach(function() {
    logger = winston.createLogger({ transports: [new VoidTransport()] });

    recurrentTransactions = new RecurrentTransactions.InMemoryRepository();
    transactions = new Transactions.InMemoryRepository();
  });

  it("transactions are correctly categorized", async function() {
    let transactionsData: Transaction[] = [
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Januar",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 2,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Januar",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 3,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Februar",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 4,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Februar",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 5,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete März",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 6,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom März",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 7,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete April",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 8,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom April",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 9,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Mai",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 10,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Mai",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 11,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Juni",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 12,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Juni",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 13,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Juli",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 14,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Juli",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 15,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 16,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 17,
            accountId: 1,
            absAmount: 25.6,
            isExpense: false,
            bookingDate: new Date(),
            purpose: "Strom August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 18,
            accountId: 1,
            absAmount: 25.6,
            isExpense: false,
            bookingDate: new Date(),
            purpose: "Strom August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "DE13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 19,
            accountId: 1,
            absAmount: 2109.13,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "I do not have a friend",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: "AT13700800000061110500",
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        }
    ];
    await transactions.saveArray(transactionsData);

    await deduceRecurrentTransactions(
      recurrentTransactions,
      transactions,
      1
    );

    const result = await recurrentTransactions.findByAccountIds([1]);

    expect(result.length).to.equal(3);

    expect(result[0].id).to.equal(1);
    expect(result[0].frequency).to.equal(TransactionFrequency.Unknown);
    expect(result[0].isExpense).to.equal(true);
    expect(result[0].isConfirmed).to.equal(false);
    expect(result[0].transactionIds).to.eql([1,3,5,7,9,11,13,15]);

    expect(result[1].id).to.equal(2);
    expect(result[1].frequency).to.equal(TransactionFrequency.Unknown);
    expect(result[1].isExpense).to.equal(true);
    expect(result[1].isConfirmed).to.equal(false);
    expect(result[1].transactionIds).to.eql([2,4,6,8,10,12,14,16]);

    expect(result[2].id).to.equal(3);
    expect(result[2].frequency).to.equal(TransactionFrequency.Unknown);
    expect(result[2].isExpense).to.equal(false);
    expect(result[2].isConfirmed).to.equal(false);
    expect(result[2].transactionIds).to.eql([17,18]);
  });
});
