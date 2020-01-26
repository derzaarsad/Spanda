export type NotificationRule = {
  id?: number;
  triggerEvent: string;
  params: any;
  callbackHandle: string;
  includeDetails: boolean;
};
