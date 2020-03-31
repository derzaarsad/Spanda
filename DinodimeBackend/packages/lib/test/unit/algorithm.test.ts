import { Algorithm } from "../../src/algorithm";
import { Transaction } from "../../src/transactions";
import chai from "chai";
const expect = chai.expect;

describe("unit: Algorithm", function() {
  it("Get recurrent transaction", async function() {
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
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Januar",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Februar",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Februar",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete März",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom März",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete April",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom April",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Mai",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Mai",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Juni",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Juni",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete Juli",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom Juli",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 575,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "miete August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "Strom August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: false,
            bookingDate: new Date(),
            purpose: "Strom August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 25.6,
            isExpense: false,
            bookingDate: new Date(),
            purpose: "Strom August",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        },
        {
            id: 1,
            accountId: 1,
            absAmount: 2109.13,
            isExpense: true,
            bookingDate: new Date(),
            purpose: "I do not have a friend",
            counterPartName: undefined,
            counterPartAccountNumber: undefined,
            counterPartIban: undefined,
            counterPartBlz: undefined,
            counterPartBic: undefined,
            counterPartBankName: undefined
        }
    ]
    const result = Algorithm.GetRecurrentTransaction(transactionsData);
    expect(result.length).to.equal(3)
    expect(result[0].length).to.equal(8)
    expect(result[1].length).to.equal(8)
    expect(result[2].length).to.equal(2)

    expect(result[0][0].absAmount).to.equal(575)
    expect(result[0][1].absAmount).to.equal(575)
    expect(result[0][2].absAmount).to.equal(575)
    expect(result[0][3].absAmount).to.equal(575)
    expect(result[0][4].absAmount).to.equal(575)
    expect(result[0][5].absAmount).to.equal(575)
    expect(result[0][6].absAmount).to.equal(575)
    expect(result[0][7].absAmount).to.equal(575)

    expect(result[1][0].absAmount).to.equal(25.6)
    expect(result[1][1].absAmount).to.equal(25.6)
    expect(result[1][2].absAmount).to.equal(25.6)
    expect(result[1][3].absAmount).to.equal(25.6)
    expect(result[1][4].absAmount).to.equal(25.6)
    expect(result[1][5].absAmount).to.equal(25.6)
    expect(result[1][6].absAmount).to.equal(25.6)
    expect(result[1][7].absAmount).to.equal(25.6)

    expect(result[2][0].absAmount).to.equal(25.6)
    expect(result[2][1].absAmount).to.equal(25.6)

    // isExpense
    expect(result[0][0].isExpense).to.equal(true)
    expect(result[0][1].isExpense).to.equal(true)
    expect(result[0][2].isExpense).to.equal(true)
    expect(result[0][3].isExpense).to.equal(true)
    expect(result[0][4].isExpense).to.equal(true)
    expect(result[0][5].isExpense).to.equal(true)
    expect(result[0][6].isExpense).to.equal(true)
    expect(result[0][7].isExpense).to.equal(true)

    expect(result[1][0].isExpense).to.equal(true)
    expect(result[1][1].isExpense).to.equal(true)
    expect(result[1][2].isExpense).to.equal(true)
    expect(result[1][3].isExpense).to.equal(true)
    expect(result[1][4].isExpense).to.equal(true)
    expect(result[1][5].isExpense).to.equal(true)
    expect(result[1][6].isExpense).to.equal(true)
    expect(result[1][7].isExpense).to.equal(true)

    expect(result[2][0].isExpense).to.equal(false)
    expect(result[2][1].isExpense).to.equal(false)
  });
});
