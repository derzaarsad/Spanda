import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { CreateInternalErrorResponse, CreateSimpleResponse } from "./lambda-util";
import { ServiceProvider } from "./service-provider";
import { WebFormCompletion } from "dinodime-lib";

const services = new ServiceProvider(process.env);
const log = services.logger;

function isWebFormCompletion(item: any): item is WebFormCompletion {
  const candidate = item as WebFormCompletion;
  return candidate.webFormId !== undefined && candidate.userSecret !== undefined;
}

export const receiveWebformId = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  log.debug("Received event", event);

  const data = JSON.parse(event.body);
  if (!isWebFormCompletion(data)) {
    log.debug("error", "invalid request");
    return CreateSimpleResponse(400, "invaild request");
  }

  const completion: WebFormCompletion = data;

  throw new Error("impelement me");
};
