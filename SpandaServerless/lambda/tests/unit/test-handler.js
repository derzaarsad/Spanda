'use strict';

const app = require('../../api.js');
const chai = require('chai');

const expect = chai.expect;
var event, context;

describe('Tests index', function () {
    it('verifies successful response', async () => {
        event = {
            headers: {
                "Authorization": "bearer 5325626"
            }
        };

        const result = await app.isUserAuthenticated(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal("hello world");
        // expect(response.location).to.be.an("string");
    });
});
