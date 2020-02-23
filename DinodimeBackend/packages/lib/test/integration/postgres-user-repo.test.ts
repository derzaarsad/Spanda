/* eslint-env node, mocha */
import chai from "chai";
const expect = chai.expect;

import format from "pg-format";
import { UsersSchema } from "../../src/schema/users";
import { Users, User } from "../../src/users";
import { Pool } from "pg";

describe("postgres users repository", function() {
  let users: Users.PostgreSQLRepository;

  before(function() {
    const schema = new UsersSchema();
    users = new Users.PostgreSQLRepository(new Pool(), format, schema);
  });

  beforeEach(async function() {
    await users.deleteAll();
  });

  it("returns null when user not found", async function() {
    const result = await users.findById("chapu");
    expect(result).to.be.null;
  });

  it("stores and retrieves a user", async function() {
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.creationDate = new Date("2019-11-11T19:31:50.379+00:00");

    await users.save(user);
    const result = await users.findById("chapu");
    expect(result).to.eql(user);
  });

  it("stores and retrieves a user with bank connections", async function() {
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.creationDate = new Date("2019-11-11T19:31:50.379+00:00");
    user.bankConnectionIds.push(1);
    user.bankConnectionIds.push(2);
    user.bankConnectionIds.push(3);

    await users.save(user);
    const result = await users.findById("chapu");
    expect(result).to.eql(user);
  });

  it("find by ids", async function() {
    await users.save(new User("chapu1", "chapu1@mischung.net", "+666 666 666", false));
    await users.save(new User("chapu2", "chapu2@mischung.net", "+666 666 666", false));
    await users.save(new User("chapu3", "chapu3@mischung.net", "+666 666 666", false));

    const result = await users.findByIds(["chapu1","chapu2","chapu3"]);
    expect(result.length).to.equal(3);
    expect(result[0].username).to.equal("chapu1");
    expect(result[1].username).to.equal("chapu2");
    expect(result[2].username).to.equal("chapu3");

    expect(result[0].email).to.equal("chapu1@mischung.net");
    expect(result[1].email).to.equal("chapu2@mischung.net");
    expect(result[2].email).to.equal("chapu3@mischung.net");
  });

  it("overwrites the properties of an existing user on save", async function() {
    const user = new User("chapu", "chapu@mischung.net", "+666 666 666", false);
    user.creationDate = new Date("2019-11-11T19:31:50.379+00:00");
    user.bankConnectionIds.push(1);

    const modifiedUser = await users.save(user);
    modifiedUser.isAutoUpdateEnabled = true;
    modifiedUser.bankConnectionIds = [2, 3];
    await users.save(modifiedUser);

    const result = await users.findById("chapu");
    expect(result).to.eql(modifiedUser);
  });
});
