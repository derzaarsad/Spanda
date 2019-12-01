'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const uuidv4 = require('uuid/v4');
const RuleHandle = require('../../lib/rule-handle');

describe('rule handles in-memory repository', function() {
  it('calls the id generator on creation', async function() {
    const repo = RuleHandle.NewInMemoryRepository(uuidv4)

    const handle = repo.new(1, 1, 'NEW_TRANSACTIONS', {})

    expect(handle.id).to.be.a('string')
  });

  it('indexes the rule by its id', async function() {
    const repo = RuleHandle.NewInMemoryRepository(uuidv4)

    const handle = repo.new(1, 1, 'NEW_TRANSACTIONS', {})
    const ruleId = handle.id

    await repo.save(handle)
    const fromRepo = await repo.findById(ruleId)

    expect(fromRepo).to.be.eql(handle);
  });

  it('returns a falsy when rule not found', async function() {
    const repo = RuleHandle.NewInMemoryRepository(uuidv4)

    const fromRepo = await repo.findById('orange juice')

    expect(fromRepo).to.not.be.ok
  });
})
