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

/**
 * The basic rule handle factory generates rule handle ids by concatenating the user id with the
 * type of notification the rule should apply for.
 */
export class BasicRuleHandleFactory implements RuleHandleFactory {
  create(finApiId: number, userId: string, type: string, args?: any): RuleHandle {
    return {
      id: `${userId}|${type}`,
      finApiId: finApiId,
      userId: userId,
      type: type,
      args: args
    };
  }
}

/**
 * The UUID rule handle factory generates random rule handle ids.
 */
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
