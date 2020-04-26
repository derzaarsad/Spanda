import { SharedBank, TransactionFrequency, Token, SharedRecurrentTransaction } from 'dinodime-sharedmodel';
import { GetBankByBLZ, GetRecurrentTransactions, UpdateRecurrentTransactions, GetWebformIdAndToken } from "../../services/bank-utils";

describe('App Component Test',() => {

	let backendUrl;

    beforeEach(function() {
		backendUrl = "onlyfortest";
    })
	
	it('get bank by BLZ', async function() {

		let testBlz = "00000000";

		const result = GetBankByBLZ(backendUrl,testBlz);

		expect(result.url).to.be.equal("onlyfortest/banks/" + testBlz)
		expect(result.method).to.be.equal("GET");
		expect(result.headers["Content-Type"]).to.be.equal("application/x-www-form-urlencoded")
	})

	it('get webform id and token', async function() {

		let bank: SharedBank = {
			id: 349347,
			name: "",
			loginHint: "",
			bic: "",
			blz: ""
		};

		let token: Token = {
			token_type: "bearer",
			expires_in: 0,
			scope: "",
			refresh_token: "",
			access_token: "o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM"
		};

		const result = GetWebformIdAndToken(backendUrl,bank,token);

		expect(result.body.bankId).to.be.an('number')

		expect(result.url).to.be.equal("onlyfortest/bankConnections/import")
		expect(result.method).to.be.equal("POST");
		expect(result.body.bankId).to.be.equal(bank.id)
		expect(result.headers["Content-Type"]).to.be.equal("application/json")
		expect(result.headers["Authorization"]).to.be.equal("bearer o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM")
	})

	it('get recurrent transactions', async function() {

		let token: Token = {
			token_type: "bearer",
			expires_in: 0,
			scope: "",
			refresh_token: "",
			access_token: "o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM"
		};

		const result = GetRecurrentTransactions(backendUrl,token);

		expect(result.url).to.be.equal("onlyfortest/recurrentTransactions")
		expect(result.method).to.be.equal("GET");
		expect(result.headers["Content-Type"]).to.be.equal("application/json")
		expect(result.headers["Authorization"]).to.be.equal("bearer o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM")
	})

	it('update recurrent transactions', async function() {

		let sharedRecurrentTransactions: SharedRecurrentTransaction[] = [
			{
				id: 1,
				accountId: 2,
				absAmount: 37,
				isExpense: false,
				isConfirmed: true,
				frequency: TransactionFrequency.Quarterly,
				counterPartName: "Dinodime GmbH"
			}
		];

		let token: Token = {
			token_type: "bearer",
			expires_in: 0,
			scope: "",
			refresh_token: "",
			access_token: "o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM"
		};

		const result = UpdateRecurrentTransactions(backendUrl,sharedRecurrentTransactions,token);

		expect(result.url).to.be.equal("onlyfortest/recurrentTransactions/update")
		expect(result.method).to.be.equal("POST");
		expect(result.headers["Content-Type"]).to.be.equal("application/json")
		expect(result.headers["Authorization"]).to.be.equal("bearer o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM")

		expect(result.body.recurrenttransactions).to.be.exist;
		expect(result.body.recurrenttransactions[0]).to.be.exist;
		expect(result.body.recurrenttransactions[0].id).to.be.equal(1);
		expect(result.body.recurrenttransactions[0].accountId).to.be.equal(2);
		expect(result.body.recurrenttransactions[0].absAmount).to.be.equal(37);
		expect(result.body.recurrenttransactions[0].isExpense).to.be.equal(false);
		expect(result.body.recurrenttransactions[0].isConfirmed).to.be.equal(true);
		expect(result.body.recurrenttransactions[0].frequency).to.be.equal(TransactionFrequency.Quarterly);
		expect(result.body.recurrenttransactions[0].counterPartName).to.be.equal("Dinodime GmbH");
	})

});