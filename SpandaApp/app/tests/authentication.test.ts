import { AuthenticationService } from '../services/authentication.service';
import { HttpClient, HttpHeaders } from "@angular/common/http";

describe('App Component Test',() => {

	let httpClient;
	let authenticationService;

    beforeEach(function() {
		httpClient = HttpClient;
		authenticationService = new AuthenticationService(httpClient);
	})
	
	it('construct message authenticateAndSave to send via REST', async function() {

		let username = "testuser";
		let password = "password123";

		const result = authenticationService.__authenticateAndSave__(username,password);

		expect(result.length).to.be.equal(3)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
		expect(result[2]).to.be.an('object')

		expect(result[1].username).to.be.an('string')
		expect(result[1].password).to.be.an('string')

		expect(result[2].headers).to.be.an('object')

		expect(result[0]).to.be.equal("onlyfortest/oauth/login")
		expect(result[1].username).to.be.equal(username)
		expect(result[1].password).to.be.equal(password)

		expect(result[2].headers.has("Content-Type")).to.be.true
		expect(result[2].headers.get("Content-Type")).to.be.equal("application/json")
	})

	it('construct message setNewRefreshAndAccessToken to send via REST', async function() {
		
		const result = authenticationService.__setNewRefreshAndAccessToken__("5478357685438756");

		expect(result.length).to.be.equal(3)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
		expect(result[2]).to.be.an('object')
	})

	it('construct message isUserAuthenticated to send via REST', async function() {
		
		const result = authenticationService.__isUserAuthenticated__("5478357685438756","bearer");

		expect(result.length).to.be.equal(2)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
	})

	it('construct message register to send via REST', async function() {
		
		const result = authenticationService.__register__("testuser","password123");

		expect(result.length).to.be.equal(3)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
		expect(result[2]).to.be.an('object')
	})

});