/* eslint-env node, mocha */
import chai from "chai";
import winston from "winston";
import { Context, APIGatewayProxyEvent } from "aws-lambda";
import { VoidTransport, MockSQSPublisher, User, Users, PushMessaging } from "dinodime-lib";
import { WebFormCallbackHandlerConfiguration, webFormCallbackHandler } from "../../src/webform-callback-handler";
import { TestMessaging } from "../test-utility";

const expect = chai.expect;

describe("webform callback handler", function () {
  let context: Context;
  let sqs: MockSQSPublisher;
  let users: Users.UsersRepository;
  let configuration: WebFormCallbackHandlerConfiguration;
  let pushMessaging: PushMessaging;

  beforeEach(function () {
    context = {} as Context;
    sqs = new MockSQSPublisher();
    users = new Users.InMemoryRepository();
    pushMessaging = new TestMessaging();
    configuration = {
      log: winston.createLogger({ transports: [new VoidTransport()] }),
      sqs: sqs,
      users: users,
      pushMessaging: pushMessaging
    };
  });

  it("doesn't forward notification when the params are missing", async function () {
    const event = {
      pathParameters: {},
    };

    const result = await webFormCallbackHandler(event as APIGatewayProxyEvent, context, configuration);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(202);
    expect(sqs.publishedData).to.be.empty;
  });

  it("doesn't forward notification when the params are invalid", async function () {
    const event = ({
      pathParameters: {
        webFormAuth: "nada",
      },
    } as unknown) as APIGatewayProxyEvent;

    const result = await webFormCallbackHandler(event, context, configuration);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(202);
    expect(sqs.publishedData).to.be.empty;
  });

  it("doesn't forward notification when user not found", async function () {
    const event = ({
      pathParameters: {
        webFormAuth: "123-secret-pushtoken",
      },
    } as unknown) as APIGatewayProxyEvent;

    const result = await webFormCallbackHandler(event, context, configuration);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(202);
    expect(sqs.publishedData).to.be.empty;
  });

  it("forwards notification when auth matches", async function () {
    const user = new User("test", "test@example.com", "+666 666 666", true);
    user.activeWebFormId = 123;
    user.activeWebFormAuth = "secret";
    users.save(user);

    const event = ({
      pathParameters: {
        webFormAuth: "123-secret-pushtoken",
      },
    } as unknown) as APIGatewayProxyEvent;

    const result = await webFormCallbackHandler(event, context, configuration);

    expect(result).to.be.an("object");
    expect(result.statusCode).to.equal(202);
    expect(sqs.publishedData.length).to.equal(1);

    expect(sqs.publishedData[0]).to.eql({
      messageBody: {
        webFormId: 123,
        userSecret: "secret",
      },
    });
  });
});
