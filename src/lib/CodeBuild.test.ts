import "dotenv/config";
import { CodeBuildClient } from "@aws-sdk/client-codebuild";
import { CodeBuild } from "./CodeBuild";

const AWS_REGION = process.env.AWS_REGION || "";
const TEST_CODE_BUILD_ID = process.env.TEST_CODE_BUILD_ID || "";

test("fetch-build", async () => {
  const cbClient = new CodeBuildClient({
    region: AWS_REGION,
  });

  const data = await CodeBuild.fetchBuildLogUrl(TEST_CODE_BUILD_ID, cbClient);
  console.log(data);
  expect(1).toBe(1);
});
