import RuleHandle from "./rule-handle";

export default interface RuleHandleRepository {
  findById(id: string): Promise<RuleHandle | null>;
  save(ruleHandle: RuleHandle): Promise<RuleHandle>;
}
