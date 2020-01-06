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
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete Januar'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom Januar'
          },
          {
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete Februar'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom Februar'
          },
          {
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete März'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom März'
          },
          {
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete April'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom April'
          },
          {
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete Mai'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom Mai'
          },
          {
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete Juni'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom Juni'
          },
          {
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete Juli'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom Juli'
          },
          {
            'absAmount': 575,
            'isExpense': true,
            'purpose': 'miete August'
          },
          {
            'absAmount': 25.6,
            'isExpense': true,
            'purpose': 'Strom August'
          }
      ]
      const result = algorithm.GetRecurrentTransaction(transactionsData);
      expect(result.length).to.equal(2)
      expect(result[0].length).to.equal(8)
      expect(result[1].length).to.equal(8)

      expect(result[0][0].absAmount).to.equal(575)
      expect(result[0][1].absAmount).to.equal(575)
      expect(result[0][2].absAmount).to.equal(575)
      expect(result[0][3].absAmount).to.equal(575)
      expect(result[0][4].absAmount).to.equal(575)
      expect(result[0][5].absAmount).to.equal(575)
      expect(result[0][6].absAmount).to.equal(575)
      expect(result[0][7].absAmount).to.equal(575)

      expect(result[1][0].absAmount).to.equal(25.6)
      expect(result[1][1].absAmount).to.equal(25.6)
      expect(result[1][2].absAmount).to.equal(25.6)
      expect(result[1][3].absAmount).to.equal(25.6)
      expect(result[1][4].absAmount).to.equal(25.6)
      expect(result[1][5].absAmount).to.equal(25.6)
      expect(result[1][6].absAmount).to.equal(25.6)
      expect(result[1][7].absAmount).to.equal(25.6)
  })

})
