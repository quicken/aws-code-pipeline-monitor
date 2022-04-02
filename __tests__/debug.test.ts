import "dotenv/config";
import {
  DynamoDBClient,
  DeleteItemCommand,
  DeleteItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import {
  CodeBuildClient,
  BatchGetBuildsCommand,
} from "@aws-sdk/client-codebuild";
import {
  CodeDeployClient,
  BatchGetDeploymentTargetsCommand,
  ListDeploymentTargetsCommand,
} from "@aws-sdk/client-codedeploy";
import { mockClient } from "aws-sdk-client-mock";

import { BitBucket } from "../src/lib/BitBucket";
import { Commit, RawMessage } from "../src/types/common";
import {
  CodePipelineExecutionEvent,
  CodePipelineStageEvent,
  CodePipelineActionEvent,
} from "../src/types/AwsCodePipeline";
import { Meerkat } from "../src/Meerkat";

import { AWS_LIST_TARGETS, AWS_BATCH_TARGETS } from "./sample/aws/codeDeploy";
import { SAMPLE_BATCH_BUILDS } from "./sample/aws/codeBuild";

const DYNAMO_ENDPOINT = process.env.DYNAMO_ENDPOINT;
const DYNAMO_DB = new DynamoDBClient({
  endpoint: DYNAMO_ENDPOINT,
  region: "ap-southeast-2",
});
const DB_TABLE = process.env.DB_TABLE || "devops-pipeline-monitor";

// const dynamoDbMock = mockClient(DynamoDBClient) as any;
const codeBuildMock = mockClient(CodeBuildClient) as any;
const codeDeployMock = mockClient(CodeDeployClient) as any;

jest.mock("../src/lib/BitBucket", () => {
  return {
    BitBucket: jest.fn().mockImplementation(() => {
      return {
        fetchCommit: (repo: string, commitId: string): Promise<Commit> => {
          return new Promise((resolve, reject) => {
            resolve({
              id: "f7ec85262da48e2b15d03037b138963c5a89d39f",
              author: "Marcel Scherzet <mscherzer@gmail.com>",
              summary:
                "DEV-666 - Custom verification link for NLE\n\nRequires a matching lambda function\n",
              link: "https://api.bitbucket.org/2.0/repositories/yourcompany/yourproject/commit/3fcdaa5ac3e29c79008319ede6c092643f204af0",
            });
          });
        },
      };
    }),
  };
});

const bitBucket = new BitBucket("", "");

beforeEach(async () => {
  codeBuildMock.reset();
  codeDeployMock.reset();
  const deleteItemCommandInput: DeleteItemCommandInput = {
    TableName: DB_TABLE,
    Key: {
      executionId: { S: "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969" },
    },
  };
  const deleteItemCommand = new DeleteItemCommand(deleteItemCommandInput);
  await DYNAMO_DB.send(deleteItemCommand);
});

test("debug", async () => {
  codeBuildMock.on(BatchGetBuildsCommand).resolves(SAMPLE_BATCH_BUILDS);
  codeDeployMock.on(ListDeploymentTargetsCommand).resolves(AWS_LIST_TARGETS);
  codeDeployMock
    .on(BatchGetDeploymentTargetsCommand)
    .resolves(AWS_BATCH_TARGETS);

  const meerkat = new Meerkat(DYNAMO_DB, bitBucket, "discord");

  const events = getPipelineSuccessFlow();
  for await (const event of events) {
    const rawMessage: RawMessage = {
      isJson: true,
      subject: "",
      body: event,
    };

    await meerkat.handleMessage(rawMessage);
  }
  expect(1).toBe(1);
});

const getPipelineSuccessFlow = () => {
  const event: (
    | CodePipelineExecutionEvent
    | CodePipelineActionEvent
    | CodePipelineStageEvent
  )[] = [];
  /* ===========================================================*/
  /* 2022-04-02T02:22:36.313Z */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:22:27Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "df3adc51-baf9-4004-9cbe-8c4f35c83ed7",
      stage: "DeployToExternalAccount",
      "execution-result": {
        "external-execution-url":
          "https://console.aws.amazon.com/codedeploy/home?region=ap-southeast-2#/deployments/d-6QQL9R3SF",
        "external-execution-summary": "Deployment Succeeded",
        "external-execution-id": "d-6QQL9R3SF",
      },
      action: "Deploy-Demo",
      state: "SUCCEEDED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:30:50.159+10:00 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:30:46Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "Source",
      action: "Source",
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeStarSourceConnection",
        category: "Source",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:30:50.805+10:00 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Pipeline Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:30:46Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      "execution-trigger": {
        "trigger-type": "StartPipelineExecution",
        "trigger-detail":
          "arn:aws:sts::329861934307:assumed-role/AdminRole/marcel",
      },
      state: "STARTED",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:30:53.454 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Stage Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:30:46Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      state: "STARTED",
      stage: "Source",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {
      sourceActions: [],
    },
  });
  /* ===========================================================*/
  /* 2022-04-02T02:31:13.931 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:31:00Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "Build",
      action: "Build",
      "input-artifacts": [
        {
          name: "SourceArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/SourceArti/xnnVCA4",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeBuild",
        category: "Build",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:31:14.150 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Stage Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:30:59Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      state: "STARTED",
      stage: "Build",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {
      sourceActions: [],
    },
  });
  /* ===========================================================*/
  /* 2022-04-02T12:31:14.307 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:30:59Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "Source",
      "execution-result": {
        "external-execution-url":
          "https://ap-southeast-2.console.aws.amazon.com/codesuite/settings/connections/redirect?connectionArn=arn:aws:codestar-connections:ap-southeast-2:329861934307:connection/0defde9e-8b96-474b-b276-459c07f5fafd&referenceType=COMMIT&FullRepositoryId=vmlearning/axcelerate&Commit=18e57819e68813fc585368ebd8163ad5e2a3163e",
        "external-execution-summary":
          '{"ProviderType":"Bitbucket","CommitMessage":"AX-14204 - A bit more basic validation for activity enrolments\\n"}',
        "external-execution-id": "18e57819e68813fc585368ebd8163ad5e2a3163e",
      },
      "output-artifacts": [
        {
          name: "SourceArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/SourceArti/xnnVCA4",
          },
        },
      ],
      action: "Source",
      state: "SUCCEEDED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeStarSourceConnection",
        category: "Source",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:31:14.852 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Stage Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:30:59Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      state: "SUCCEEDED",
      stage: "Source",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {
      sourceActions: [],
    },
  });
  /* ===========================================================*/
  /* 2022-04-02T02:44:29.172 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Stage Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      state: "STARTED",
      stage: "DeployToExternalAccount",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {
      sourceActions: [],
    },
  });
  /* ===========================================================*/
  /* 2022-04-02T02:44:29 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Greenmount",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:44:31.318 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:21Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Demo",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:44:34.183 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Mother",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:45:23.649 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:21Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Kirra",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:45:25.855 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Greenmount",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:45:30.681 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:21Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Demo",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:45:39.569 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Mother",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:47:27.169 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Mother",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:47:35.289 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:21Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Kirra",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:47:39 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:21Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Demo",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:47:41.221 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Greenmount",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:44:28.958 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Stage Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      state: "SUCCEEDED",
      stage: "Build",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {
      sourceActions: [],
    },
  });
  /* ===========================================================*/
  /* 2022-04-02T02:44:29.829 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:20Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "Build",
      "execution-result": {
        "external-execution-url":
          "https://console.aws.amazon.com/codebuild/home?region=ap-southeast-2#/builds/ax-core-testing:91c87dfe-a901-456f-8b7c-9d1dc497714b/view/new",
        "external-execution-id":
          "ax-core-testing:91c87dfe-a901-456f-8b7c-9d1dc497714b",
      },
      "output-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      action: "Build",
      state: "SUCCEEDED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeBuild",
        category: "Build",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:44:30.234 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:44:21Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      action: "Deploy-Kirra",
      "input-artifacts": [
        {
          name: "BuildArtifact",
          s3location: {
            bucket: "ax-project-artifact",
            key: "axcelerate-testing/BuildArtif/Aez6iry",
          },
        },
      ],
      state: "STARTED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:58:28.424 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:58:15Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      "execution-result": {
        "external-execution-url":
          "https://console.aws.amazon.com/codedeploy/home?region=ap-southeast-2#/deployments/d-PYMG003SF",
        "external-execution-summary": "Deployment Succeeded",
        "external-execution-id": "d-PYMG003SF",
      },
      action: "Deploy-Kirra",
      state: "SUCCEEDED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T12:58:49.285 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:58:45Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      "execution-result": {
        "external-execution-url":
          "https://console.aws.amazon.com/codedeploy/home?region=ap-southeast-2#/deployments/d-Z3L5D13SF",
        "external-execution-summary": "Deployment Succeeded",
        "external-execution-id": "d-Z3L5D13SF",
      },
      action: "Deploy-Greenmount",
      state: "SUCCEEDED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:58:50 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Stage Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:58:46Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      state: "SUCCEEDED",
      stage: "DeployToExternalAccount",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {
      sourceActions: [],
    },
  });
  /* ===========================================================*/
  /* 2022-04-02T02:58:50.735 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Pipeline Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:58:46Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      state: "SUCCEEDED",
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:58:56.620 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:58:46Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      "execution-result": {
        "external-execution-url":
          "https://console.aws.amazon.com/codedeploy/home?region=ap-southeast-2#/deployments/d-NKBIGJ3SF",
        "external-execution-summary": "Deployment Succeeded",
        "external-execution-id": "d-NKBIGJ3SF",
      },
      action: "Deploy-Mother",
      state: "SUCCEEDED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  /* ===========================================================*/
  /* 2022-04-02T02:58:59.275 */
  event.push({
    account: "329861934307",
    detailType: "CodePipeline Action Execution State Change",
    region: "ap-southeast-2",
    source: "aws.codepipeline",
    time: "2022-04-02T02:58:46Z",
    notificationRuleArn:
      "arn:aws:codestar-notifications:ap-southeast-2:329861934307:notificationrule/dc399f2b2838ba3d9c9b5d0646396f70333f0355",
    detail: {
      pipeline: "axcelerate-testing",
      "execution-id": "8bdcdf4b-2dd1-4bbe-8aeb-562ff8b55969",
      stage: "DeployToExternalAccount",
      "execution-result": {
        "external-execution-url":
          "https://console.aws.amazon.com/codedeploy/home?region=ap-southeast-2#/deployments/d-KVNCGY3SF",
        "external-execution-summary": "Deployment Succeeded",
        "external-execution-id": "d-KVNCGY3SF",
      },
      action: "Deploy-Demo",
      state: "SUCCEEDED",
      region: "ap-southeast-2",
      type: {
        owner: "AWS",
        provider: "CodeDeploy",
        category: "Deploy",
        version: "1",
      },
      version: 16,
    },
    resources: [
      "arn:aws:codepipeline:ap-southeast-2:329861934307:axcelerate-testing",
    ],
    additionalAttributes: {},
  });
  return event;
};
