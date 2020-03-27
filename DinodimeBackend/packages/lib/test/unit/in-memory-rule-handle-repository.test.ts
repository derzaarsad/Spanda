import chai from "chai";
const expect = chai.expect;

import { v4 as uuid } from "uuid";
import { InMemoryRuleHandleRepository } from "../../src/rule-handle-repository";
import { RuleHandleFactory, UUIDRuleHandleFactory } from "../../src/rule-handle";

let factory: RuleHandleFactory;
let handles: InMemoryRuleHandleRepository;

describe("unit: In-memory rule handle repository", () => {
  beforeEach(() => {
    handles = new InMemoryRuleHandleRepository();
    factory = new UUIDRuleHandleFactory(uuid);
  });

  it("saves a rule handle", async () => {
    expect(await handles.findById("1")).to.be.null;

    const handle = factory.create(1, "test", "NEW_TRANSACTIONS");

    await handles.save(handle);
    expect(await handles.findById(handle.id)).to.eql(handle);
  });

  it("deletes a rule handle", async () => {
    const handle = factory.create(1, "test", "NEW_TRANSACTIONS");

    await handles.save(handle);
    expect(await handles.findById(handle.id)).to.eql(handle);

    await handles.delete(handle);
    expect(await handles.findById(handle.id)).to.be.null;
  });
});
