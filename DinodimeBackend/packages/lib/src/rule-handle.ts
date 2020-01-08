export type RuleHandle = {
  id: string;
  finApiId: number;
  userId: string;
  type: string;
  args?: any;
};

export interface RuleHandleFactory {
  create(finApiId: number, userId: string, type: string, args?: any): RuleHandle;
}

export class UUIDRuleHandleFactory implements RuleHandleFactory {
  private uuid: () => string;
  constructor(uuid: () => string) {
    this.uuid = uuid;
  }

  create(finApiId: number, userId: string, type: string, args?: any): RuleHandle {
    const id = this.uuid();

    return {
      id: `${userId}|${id}`,
      finApiId: finApiId,
      userId: userId,
      type: type,
      args: args
    };
  }
}
