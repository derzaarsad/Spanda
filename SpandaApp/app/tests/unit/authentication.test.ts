import { AuthenticateAndSave, SetNewRefreshAndAccessToken, IsUserAuthenticated, Register } from '../../services/authentication-utils';
import { Token } from "dinodime-sharedmodel";

describe('App Component Test',() => {

	let backendUrl;

    beforeEach(function() {
		backendUrl = "onlyfortest";
    })
	
	it('construct message authenticateAndSave to send via REST', async function() {
		this.timeout(10000); // App needs time.

		let username = "testuser";
		let password = "password123";

		const result = AuthenticateAndSave(backendUrl,username,password);

		expect(result.body.username).to.be.an('string')
		expect(result.body.password).to.be.an('string')

		expect(result.url).to.be.equal("onlyfortest/oauth/login")
		expect(result.method).to.be.equal("POST");
		expect(result.body.username).to.be.equal(username)
		expect(result.body.password).to.be.equal(password)

		expect(result.headers["Content-Type"]).to.be.equal("application/json")
	})

	it('construct message setNewRefreshAndAccessToken to send via REST', async function() {
		this.timeout(10000); // App needs time.
		
		let token: Token = {
			token_type: "bearer",
			expires_in: 0,
			scope: "",
			refresh_token: "xjVi11pfcO8v6FoNpRjNwzI0MCc7g3dFekrXkGSk1oxIrw_6jUhq2WtCjbGG6NLObUDfnpYHtMFpKplgVJBFZxFO3DF8_YvnbfQaOxf6V7d4gl7lT4LDfsyPkgL4YGeu",
			access_token: ""
		};
		const result = SetNewRefreshAndAccessToken(backendUrl,token);

		expect(result.body.refresh_token).to.be.an('string')

		expect(result.url).to.be.equal("onlyfortest/oauth/token")
		expect(result.method).to.be.equal("POST");
		expect(result.body.refresh_token).to.be.equal(token.refresh_token)

		expect(result.headers["Content-Type"]).to.be.equal("application/json")
	})

	it('construct message isUserAuthenticated to send via REST', async function() {
		this.timeout(10000); // App needs time.
		
		let token: Token = {
			token_type: "bearer",
			expires_in: 0,
			scope: "",
			refresh_token: "",
			access_token: "o1cIunYA1BgmkkNn8OQE4p4_bxNP8ztNgAs6NBVuHFvHa4saLZBE0A0R1ACvMyXrxomcMhgWo8zPUq992xjctxw5RVMAfrZpyPje1AYtYH35ipQbXVCSgfJKgtPeamBM"
		};
		const result = IsUserAuthenticated(backendUrl,token);

		expect(result.url).to.be.equal("onlyfortest/users")
		expect(result.method).to.be.equal("GET");
		expect(result.headers["Authorization"]).to.be.equal(token.token_type + " " + token.access_token)
		expect(result.headers["Content-Type"]).to.be.equal("application/json")
	})

	it('construct message register to send via REST', async function() {
		this.timeout(10000); // App needs time.
		
		let username = "testuser@testdomain.com";
		let password = "password123";
		const result = Register(backendUrl,username,password);

		expect(result.body.id).to.be.an('string')
		expect(result.body.password).to.be.an('string')

		expect(result.url).to.be.equal("onlyfortest/users")
		expect(result.body.id).to.be.equal(username)
		expect(result.body.password).to.be.equal(password)

		expect(result.headers["Content-Type"]).to.be.equal("application/json")
	})

});