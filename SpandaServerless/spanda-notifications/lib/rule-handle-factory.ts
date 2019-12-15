import RuleHandle from "./rule-handle";

export default interface RuleHandleFactory {
  create(finApiId: number, userId: string, type: string, args?: any): RuleHandle;
}
