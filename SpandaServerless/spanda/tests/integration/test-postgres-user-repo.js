'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const format = require('pg-format');
const { Pool } = require('pg');

const usersSchema = require('../../lib/schema/users');
const types = require('../../lib/schema/types');

const Users = require('../../lib/users');

describe('postgres users repository', function() {
  let users

  before(function() {
    users = Users.NewPostgreSQLRepository(new Pool(), format, usersSchema, types);
  })

  beforeEach(async function() {
    await users.deleteAll();
  })

  it('returns null when user not found', async function() {
    const result = await users.findById('chapu')
    expect(result).to.be.null
  })

  it('stores and retrieves a user', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.creationDate = new Date('2019-11-11T19:31:50.379+00:00')

    await users.save(user)
    const result = await users.findById('chapu')
    expect(result).to.eql(user)
  })

  it('stores and retrieves a user with bank connections', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.creationDate = new Date('2019-11-11T19:31:50.379+00:00')
    user.bankConnectionIds.push(1)
    user.bankConnectionIds.push(2)
    user.bankConnectionIds.push(3)

    await users.save(user)
    const result = await users.findById('chapu')
    expect(result).to.eql(user)
  })

  it('overwrites the properties of an existing user on save', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.creationDate = new Date('2019-11-11T19:31:50.379+00:00')
    user.bankConnectionIds.push(1)

    const modifiedUser = await users.save(user)
    modifiedUser.isAutoUpdateEnabled = true
    modifiedUser.bankConnectionIds = [2, 3]
    await users.save(modifiedUser)

    const result = await users.findById('chapu')
    expect(result).to.eql(modifiedUser)
  })
})
