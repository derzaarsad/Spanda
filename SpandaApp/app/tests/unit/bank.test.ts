import { BankService } from '../../services/bank.service';
import { DummyAuthenticationService } from "../DummyAuthentication.service"
import { Bank } from '~/models/bank.model';

describe('App Component Test',() => {

	let bankService;

    beforeEach(function() {
		bankService = new BankService(new DummyAuthenticationService);
	})
	
	it('get bank by BLZ', async function() {

		let testBlz = "00000000";

		const result = bankService.__getBankByBLZ__(testBlz);

		expect(result.length).to.be.equal(2)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')

		expect(result[0]).to.be.equal("onlyfortest/banks/" + testBlz)
		expect(result[1]["Content-Type"]).to.be.equal("application/x-www-form-urlencoded")
	})

	it('get webform id and token', async function() {

		let bank = new Bank();
		bank.Id = 349347;

		const result = bankService.__getWebformIdAndToken__(bank);

		expect(result.length).to.be.equal(3)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
		expect(result[2]).to.be.an('object')

		expect(result[1].bankId).to.be.an('number')

		expect(result[0]).to.be.equal("onlyfortest/bankConnections/import")
		expect(result[1].bankId).to.be.equal(bank.Id)
		expect(result[2]["Content-Type"]).to.be.equal("application/json")
		expect(result[2]["Authorization"]).to.be.equal("bearer 12345678")
	})

});