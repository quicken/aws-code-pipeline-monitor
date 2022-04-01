/**
 * The CodePipelineEvent describes the properties available by all events that are generated during the life-cycle of
 * a code pipeline execution.
 *
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
 */
export type CodePipelineEvent = {
  detail: {
    pipeline: string;
    "execution-id": string;
    version: 16.0;
  };
  account: string;
  region: string;
  source: string;
  time: string;
  notificationRuleArn: string;
  resources: string[];
};

/**
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
 */
export type CodePipelineExecutionEvent = CodePipelineEvent & {
  detailType: "CodePipeline Pipeline Execution State Change";
  detail: {
    "execution-trigger"?: {
      "trigger-type": "Webhook";
      "trigger-detail": string;
    };
    state: "STARTED" | "SUCCEEDED" | "FAILED";
  };
  additionalAttributes: {
    sourceActions?: any[];
    failedActionCount?: number;
    failedActions?: CodePipelineFailedAction[];
    failedStage?: string;
  };
};

type CodePipelineFailedAction = {
  action: string;
  additionalInformation: string;
};

/**
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
 */
export type CodePipelineStageEvent = CodePipelineEvent & {
  detailType: "CodePipeline Stage Execution State Change";
  detail: {
    state: "STARTED" | "SUCCEEDED" | "FAILED";
    stage: string;
  };
  additionalAttributes: {
    sourceActions?: any[];
    failedActionCount?: number;
    failedActions?: CodePipelineFailedAction[];
  };
};

type CodePipelineActionType = {
  owner: "AWS";
  provider: string;
  category: string;
  version: "1";
};

type CodePipeLineArtifact = {
  name: string;
  s3location: {
    bucket: string;
    key: string;
  };
};

/**
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html
 */
export type CodePipelineActionEvent = CodePipelineEvent & {
  detailType: "CodePipeline Action Execution State Change";
  detail: {
    "execution-result"?: {
      "external-execution-url": string;
      "external-execution-id": string;
      "external-execution-summary"?: string;
      "error-code"?: string;
    };
    "input-artifacts"?: CodePipeLineArtifact[];
    "output-artifacts"?: CodePipeLineArtifact[];
    state: "STARTED" | "SUCCEEDED" | "FAILED";
    action: "Source" | "Build" | string;
    stage: string;
    region: string;
    type: CodePipelineActionType;
  };
  additionalAttributes: {
    sourceActions?: any[];
    additionalInformation?: string;
  };
};
