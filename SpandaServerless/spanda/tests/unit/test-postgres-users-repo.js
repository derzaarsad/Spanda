'use strict';

/* eslint-env node, mocha */
const chai = require('chai');
const expect = chai.expect;

const format = require('pg-format');
const usersSchema = require('../../lib/schema/users');

const Users = require('../../lib/users');

describe('postgres users repository', function() {
  let users

  beforeEach(function() {
    users = Users.NewPostgreSQLRepository(null, format, usersSchema);
  })

  it('renders the find-by-id query', async function() {
    const result = await users.findByIdQuery('chapu')
    expect(result).to.be.a('string');
    expect(result).to.equal("SELECT * FROM users WHERE username = 'chapu' LIMIT 1");
  })

  it('renders the save query', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.creationDate = new Date('2019-11-11T19:31:50.379+00:00')

    const result = users.saveQuery(user)
    expect(result).to.be.a('string');
    expect(result).to.equal("INSERT INTO users (username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids,activewebformid,activewebformauth) VALUES ('chapu','2019-11-11 19:31:50.379+00','0','f','chapu@mischung.net','+666 666 666','f',NULL,NULL,NULL)");
  })

  it('renders the save query with non-empty account ids', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.creationDate = new Date('2019-11-11T19:31:50.379+00:00')
    user.bankConnectionIds.push(1)
    user.bankConnectionIds.push(2)
    user.bankConnectionIds.push(3)

    const result = users.saveQuery(user)
    expect(result).to.be.a('string');
    expect(result).to.equal("INSERT INTO users (username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids,activewebformid,activewebformauth) VALUES ('chapu','2019-11-11 19:31:50.379+00','0','f','chapu@mischung.net','+666 666 666','f','{1,2,3}',NULL,NULL)");
  })

  it('renders the update query', async function() {
    const user = users.new('chapu', 'chapu@mischung.net', '+666 666 666', false)
    user.creationDate = new Date('2019-11-11T19:31:50.379+00:00')

    const result = users.updateQuery(user)
    expect(result).to.be.a('string');
    expect(result).to.equal("UPDATE users SET (username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids,activewebformid,activewebformauth) = ('chapu','2019-11-11 19:31:50.379+00','0','f','chapu@mischung.net','+666 666 666','f',NULL,NULL,NULL) WHERE username = 'chapu'");
  })
})
