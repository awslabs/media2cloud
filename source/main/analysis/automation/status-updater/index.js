/**
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
 * Licensed under the Amazon Software License  http://aws.amazon.com/asl/
 */
const {
  SNS,
} = require('core-lib');
const CloudWatchStatus = require('./lib/cloudwatch');

const REQUIRED_ENVS = [
  'ENV_SOLUTION_ID',
  'ENV_STACKNAME',
  'ENV_SOLUTION_UUID',
  'ENV_ANONYMOUS_USAGE',
  'ENV_IOT_HOST',
  'ENV_IOT_TOPIC',
  'ENV_INGEST_BUCKET',
  'ENV_PROXY_BUCKET',
  'ENV_SNS_TOPIC_ARN',
];

exports.handler = async (event, context) => {
  console.log(`event = ${JSON.stringify(event, null, 2)}; context = ${JSON.stringify(context, null, 2)};`);
  try {
    const missing = REQUIRED_ENVS.filter(x => process.env[x] === undefined);
    if (missing.length) {
      throw new Error(`missing env, ${missing.join(', ')}`);
    }

    let instance;
    if (event.source) {
      instance = new CloudWatchStatus(event, context);
    }
    if (!instance) {
      throw new Error('event not supported. exiting....');
    }
    return instance.process();
  } catch (e) {
    console.error(e);
    return SNS.send('error: fail to handle event', `${e.message}\n\n${JSON.stringify(event, null, 2)}`).catch(() => false);
  }
};