/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;

import { HasAuthorization, HasMissingProperty } from "../../src/lambda-util";

describe("unit: lambda util", function() {
  
    beforeEach(function() { });
  
    it("matches upcase in hasAuthorization", async function() {
        let expected = "bearer 5325626"

        const headers = {
          "Authorization": expected
        };
    
        let result = HasAuthorization(headers);
    
        expect(result).to.equal(expected);
    });

    it('matches lowercase in hasAuthorization', async function() {
        let expected = "bearer 5325626"
    
        const headers = {
          "authorization": expected
        };
    
        let result = HasAuthorization(headers);
    
        expect(result).to.equal(expected);
      });

      it('returns falsy when header does not contain authorization in hasAuthorization', async function() {
        const headers = {
          "Accept-Language": "en-US,en;q=0.8",
        };
    
        let result = HasAuthorization(headers);
    
        expect(result).not.to.be.ok;
      });
    
      it('returns nothing when all properties given', async function() {
        const body = {
          "id": "chapu",
          "email": "chapu@mischung.net",
          "cred": 5000,
          "rad": true
        }

        let result = HasMissingProperty(body, ["id", "email", "cred", "rad"]);
    
        expect(result).not.to.be.ok;
      });
    
      it('returns the first missing property', async function() {
        const body = {
          "id": "chapu",
          "rad": true
        }

        let result = HasMissingProperty(body, ["id", "email", "cred", "rad"]);
    
        expect(result).to.equal("email");
      });


  });
  