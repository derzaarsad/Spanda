import winston from "winston";
import { FinAPI, FinAPIModel } from "dinodime-lib";

export interface UserInfoConfiguration {
  bankInterface: FinAPI;
  logger: winston.Logger;
}

export const getUserInfo = async (
  configuration: UserInfoConfiguration,
  authorization: string
): Promise<FinAPIModel.User> => {
  const { logger, bankInterface } = configuration;
  logger.log("info", "authenticating user", { authorization: authorization });
  return bankInterface.userInfo(authorization);
};
