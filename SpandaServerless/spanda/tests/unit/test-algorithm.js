'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;
const algorithm = require('../../lib/algorithm.js')

describe('algorithm', function() {

  beforeEach(function() {

  })

  it('Get recurrent transaction', async () => {
      const transactionsData = [
          {
            'amount': -575,
            'purpose': 'miete Januar'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom Januar'
          },
          {
            'amount': -575,
            'purpose': 'miete Februar'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom Februar'
          },
          {
            'amount': -575,
            'purpose': 'miete März'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom März'
          },
          {
            'amount': -575,
            'purpose': 'miete April'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom April'
          },
          {
            'amount': -575,
            'purpose': 'miete Mai'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom Mai'
          },
          {
            'amount': -575,
            'purpose': 'miete Juni'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom Juni'
          },
          {
            'amount': -575,
            'purpose': 'miete Juli'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom Juli'
          },
          {
            'amount': -575,
            'purpose': 'miete August'
          },
          {
            'amount': -25.6,
            'purpose': 'Strom August'
          }
      ]
      const result = algorithm.GetRecurrentTransaction(transactionsData);
      expect(result.length).to.equal(2)
      expect(result[0].length).to.equal(8)
      expect(result[1].length).to.equal(8)

      expect(result[0][0].amount).to.equal(-575)
      expect(result[0][1].amount).to.equal(-575)
      expect(result[0][2].amount).to.equal(-575)
      expect(result[0][3].amount).to.equal(-575)
      expect(result[0][4].amount).to.equal(-575)
      expect(result[0][5].amount).to.equal(-575)
      expect(result[0][6].amount).to.equal(-575)
      expect(result[0][7].amount).to.equal(-575)

      expect(result[1][0].amount).to.equal(-25.6)
      expect(result[1][1].amount).to.equal(-25.6)
      expect(result[1][2].amount).to.equal(-25.6)
      expect(result[1][3].amount).to.equal(-25.6)
      expect(result[1][4].amount).to.equal(-25.6)
      expect(result[1][5].amount).to.equal(-25.6)
      expect(result[1][6].amount).to.equal(-25.6)
      expect(result[1][7].amount).to.equal(-25.6)
  })

})
