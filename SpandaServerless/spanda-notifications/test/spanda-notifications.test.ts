import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import SpandaNotifications = require('../lib/spanda-notifications-stack');

test('SQS Queue Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SpandaNotifications.SpandaNotificationsStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResource('AWS::SQS::Queue',{
    VisibilityTimeout: 300
  }));
});

test('SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SpandaNotifications.SpandaNotificationsStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResource('AWS::SNS::Topic'));
});
