import { BankService } from '../../services/bank.service';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DummyAuthenticationService } from "../DummyAuthentication.service"

describe('App Component Test',() => {

	let httpClient;
	let bankService;

    beforeEach(function() {
		httpClient = HttpClient;
		bankService = new BankService(httpClient, new DummyAuthenticationService);
	})
	
	it('construct message authenticateAndSave to send via REST', async function() {

		let testBlz = "00000000";

		const result = bankService.__getBankByBLZ__(testBlz);

		expect(result.length).to.be.equal(2)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')

		expect(result[1].headers).to.be.an('object')

		expect(result[0]).to.be.equal("onlyfortest/banks/" + testBlz)
		expect(result[1].headers.has("Content-Type")).to.be.true
		expect(result[1].headers.get("Content-Type")).to.be.equal("application/x-www-form-urlencoded")
	})

});