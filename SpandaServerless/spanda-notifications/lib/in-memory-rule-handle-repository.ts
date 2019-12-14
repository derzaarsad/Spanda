import RuleHandle from "./rule-handle";
import RuleHandleRepository from "./rule-handle-repository";

export class InMemoryRuleHandleRepository implements RuleHandleRepository {
  private repository: { [index: string]: RuleHandle } = {};

  findById(id: string): Promise<RuleHandle> {
    return Promise.resolve(this.repository[id]);
  }

  save(ruleHandle: RuleHandle): Promise<RuleHandle> {
    this.repository[ruleHandle.id] = ruleHandle;
    return Promise.resolve(ruleHandle);
  }
}
