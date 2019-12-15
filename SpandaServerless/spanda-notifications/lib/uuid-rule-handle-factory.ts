import RuleHandleFactory from "./rule-handle-factory";
import RuleHandle from "./rule-handle";

export default class UUIDRuleHandleFactory implements RuleHandleFactory {
  private uuid: () => string;
  constructor(uuid: () => string) {
    this.uuid = uuid;
  }

  create(finApiId: number, userId: number, type: string, args?: any): RuleHandle {
    const id = this.uuid();

    return {
      id: id,
      finApiId: finApiId,
      userId: userId,
      type: type,
      args: args ? args : undefined
    };
  }
}
