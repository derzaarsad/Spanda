import { AuthenticationService } from '../../services/authentication.service';
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
		
		let refresh_token = "xjVi11pfcO8v6FoNpRjNwzI0MCc7g3dFekrXkGSk1oxIrw_6jUhq2WtCjbGG6NLObUDfnpYHtMFpKplgVJBFZxFO3DF8_YvnbfQaOxf6V7d4gl7lT4LDfsyPkgL4YGeu";
		const result = authenticationService.__setNewRefreshAndAccessToken__(refresh_token);

		expect(result.length).to.be.equal(3)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
		expect(result[2]).to.be.an('object')

		expect(result[1].refresh_token).to.be.an('string')

		expect(result[2].headers).to.be.an('object')

		expect(result[0]).to.be.equal("onlyfortest/oauth/token")
		expect(result[1].refresh_token).to.be.equal(refresh_token)

		expect(result[2].headers.has("Content-Type")).to.be.true
		expect(result[2].headers.get("Content-Type")).to.be.equal("application/json")
	})

	it('construct message isUserAuthenticated to send via REST', async function() {
		
		let access_token = "o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM";
		const result = authenticationService.__isUserAuthenticated__(access_token,"bearer");

		expect(result.length).to.be.equal(2)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')

		expect(result[1].headers).to.be.an('object')

		expect(result[0]).to.be.equal("onlyfortest/users")

		expect(result[1].headers.has("Authorization")).to.be.true
		expect(result[1].headers.get("Authorization")).to.be.equal("bearer " + access_token)
		expect(result[1].headers.has("Content-Type")).to.be.true
		expect(result[1].headers.get("Content-Type")).to.be.equal("application/json")
	})

	it('construct message register to send via REST', async function() {
		
		let username = "testuser@testdomain.com";
		let password = "password123";
		const result = authenticationService.__register__(username,password);

		expect(result.length).to.be.equal(3)
		expect(result[0]).to.be.an('string')
		expect(result[1]).to.be.an('object')
		expect(result[2]).to.be.an('object')

		expect(result[1].id).to.be.an('string')
		expect(result[1].password).to.be.an('string')

		expect(result[2].headers).to.be.an('object')

		expect(result[0]).to.be.equal("onlyfortest/users")
		expect(result[1].id).to.be.equal(username)
		expect(result[1].password).to.be.equal(password)

		expect(result[2].headers.has("Content-Type")).to.be.true
		expect(result[2].headers.get("Content-Type")).to.be.equal("application/json")
	})

});