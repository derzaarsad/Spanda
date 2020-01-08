/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;

import format from "pg-format";
import { UsersSchema } from "../../src/schema/users";
import { Users, User } from "../../src/users";

describe("postgres users repository", function() {
  let users: Users.PostgreSQLRepository;

  beforeEach(function() {
    users = new Users.PostgreSQLRepository(undefined, format, new UsersSchema());
  });

  it("renders the find-by-id query", async function() {
    const result = users.findByIdQuery("chapu");
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM users WHERE username = 'chapu' LIMIT 1");
  });

  it("renders the find-by-webform query", async function() {
    const result = users.findByWebFormQuery(1234567);
    expect(result).to.be.a("string");
    expect(result).to.equal("SELECT * FROM users WHERE activewebformid = '1234567' LIMIT 1");
  });

  it("renders the save query", async function() {
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.creationDate = new Date("2019-11-11T19:31:50.379+00:00");

    const result = users.saveQuery(user);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO users (username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids,activewebformid,activewebformauth) VALUES ('chapu','2019-11-11 19:31:50.379+00','0','f','chapu@mischung.net','+666 666 666','f',NULL,NULL,NULL) ON CONFLICT (username) DO UPDATE SET (username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids,activewebformid,activewebformauth) = ('chapu','2019-11-11 19:31:50.379+00','0','f','chapu@mischung.net','+666 666 666','f',NULL,NULL,NULL) WHERE users.username = 'chapu'"
    );
  });

  it("renders the save query with non-empty account ids", async function() {
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.creationDate = new Date("2019-11-11T19:31:50.379+00:00");
    user.bankConnectionIds.push(1);
    user.bankConnectionIds.push(2);
    user.bankConnectionIds.push(3);

    const result = users.saveQuery(user);
    expect(result).to.be.a("string");
    expect(result).to.equal(
      "INSERT INTO users (username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids,activewebformid,activewebformauth) VALUES ('chapu','2019-11-11 19:31:50.379+00','0','f','chapu@mischung.net','+666 666 666','f','{1,2,3}',NULL,NULL) ON CONFLICT (username) DO UPDATE SET (username,creationdate,allowance,isallowanceready,email,phone,isautoupdateenabled,bankconnectionids,activewebformid,activewebformauth) = ('chapu','2019-11-11 19:31:50.379+00','0','f','chapu@mischung.net','+666 666 666','f','{1,2,3}',NULL,NULL) WHERE users.username = 'chapu'"
    );
  });

  it("renders the delete all query", async function() {
    const result = users.deleteAllQuery();
    expect(result).to.be.a("string");
    expect(result).to.equal("DELETE FROM users");
  });
});
