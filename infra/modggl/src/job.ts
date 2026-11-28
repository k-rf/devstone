import * as gcp from "@pulumi/gcp";
import { type Input } from "@pulumi/pulumi";

import { type SecretEnvironmentBinding } from "./secrets.js";

/**
 * Cloud Run Job 作成パラメータ
 */
export interface CloudRunJobParams {
  readonly project: string;
  readonly region: string;
  readonly jobName: string;
  readonly imageUri: Input<string>;
  readonly togglOrganizationId: string;
  readonly togglWorkspaceId: string;
  readonly jobServiceAccountEmail: Input<string>;
  readonly schedulerServiceAccountMember: Input<string>;
  readonly makeExecutorMember: string;
  readonly secretBindings: readonly SecretEnvironmentBinding[];
}

/**
 * 作成された Cloud Run Job と IAM バインディングリソース群
 */
export interface CloudRunJobResources {
  readonly job: gcp.cloudrunv2.Job;
  readonly schedulerExecutorIam: gcp.cloudrunv2.JobIamMember;
  readonly makeExecutorIam: gcp.cloudrunv2.JobIamMember;
}

/**
 * Cloud Run Jobs v2 リソースと起動用 IAM 権限を作成する
 * @param params - ジョブ構成と実行プリンシパル設定
 * @returns ジョブと IAM メンバーリソース
 */
export const createCloudRunJob = (params: CloudRunJobParams): CloudRunJobResources => {
  const secretEnvironmentVariables: readonly gcp.types.input.cloudrunv2.JobTemplateTemplateContainerEnv[] =
    params.secretBindings.map((binding) => ({
      name: binding.environmentVariableName,
      valueSource: {
        secretKeyRef: {
          secret: binding.secretId,
          version: "latest",
        },
      },
    }));

  const job = new gcp.cloudrunv2.Job(
    "modggl-job",
    {
      project: params.project,
      location: params.region,
      name: params.jobName,
      template: {
        parallelism: 1,
        taskCount: 1,
        template: {
          maxRetries: 0,
          serviceAccount: params.jobServiceAccountEmail,
          containers: [
            {
              image: params.imageUri,
              envs: [
                {
                  name: "TOGGL_ORGANIZATION_ID",
                  value: params.togglOrganizationId,
                },
                {
                  name: "TOGGL_WORKSPACE_ID",
                  value: params.togglWorkspaceId,
                },
                ...secretEnvironmentVariables,
              ],
            },
          ],
        },
      },
    },
    {
      dependsOn: params.secretBindings.map((binding) => binding.iamMember),
    },
  );

  const schedulerExecutorIam = new gcp.cloudrunv2.JobIamMember("modggl-scheduler-executor", {
    project: params.project,
    location: job.location,
    name: job.name,
    role: "roles/run.jobsExecutor",
    member: params.schedulerServiceAccountMember,
  });

  const makeExecutorIam = new gcp.cloudrunv2.JobIamMember("modggl-make-executor", {
    project: params.project,
    location: job.location,
    name: job.name,
    role: "roles/run.jobsExecutorWithOverrides",
    member: params.makeExecutorMember,
  });

  return {
    job: job,
    schedulerExecutorIam: schedulerExecutorIam,
    makeExecutorIam: makeExecutorIam,
  };
};
