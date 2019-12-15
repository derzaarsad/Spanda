import RuleHandle from "./rule-handle";

export default interface RuleHandleFactory {
  create(finApiId: number, userId: number, type: string, args?: any): RuleHandle;
}
