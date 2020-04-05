import { HasMissingProperty } from "./lambda-util";

export type UserParams = {
  id: string;
  password: string;
  email: string;
  phone: string;
  isAutoUpdateEnabled: boolean;
};

const expectedUserProperties = ["id", "password", "email", "phone", "isAutoUpdateEnabled"];

export const isUserParams = (body: any): body is UserParams => {
  if (body === null) {
    return false;
  }
  const missingProperty = HasMissingProperty(body, expectedUserProperties);
  return missingProperty === null;
};
