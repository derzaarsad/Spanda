import { AuthenticationService } from '../services/authentication.service';
import { HttpClient } from "@angular/common/http";

describe('App Component Test',() => {

	let httpClient;
	let authenticationService;

    beforeEach(function() {
		httpClient = HttpClient;
		authenticationService = new AuthenticationService(httpClient);
	})
	
	it('construct message authenticateAndSave to send via REST', async function() {
		
		const result = authenticationService.__authenticateAndSave__("testuser","password123");

		expect(result.length).to.be.equal(3)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
		expect(result[2]).to.be.an('object')
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