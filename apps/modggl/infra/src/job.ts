import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

import { type SecretEnvBinding } from "./secrets";

export interface CloudRunJobArgs {
  readonly project: string;
  readonly region: string;
  readonly jobName: string;
  readonly imageUri: pulumi.Input<string>;
  readonly togglOrganizationId: string;
  readonly togglWorkspaceId: string;
  readonly jobServiceAccountEmail: pulumi.Input<string>;
  readonly schedulerServiceAccountMember: pulumi.Input<string>;
  readonly makeExecutorMember: string;
  readonly secretBindings: readonly SecretEnvBinding[];
}

export interface CloudRunJobResources {
  readonly job: gcp.cloudrunv2.Job;
  readonly schedulerInvokerIam: gcp.cloudrunv2.JobIamMember;
  readonly makeExecutorIam: gcp.cloudrunv2.JobIamMember;
}

export const createCloudRunJob = (args: CloudRunJobArgs): CloudRunJobResources => {
  const secretEnvs: gcp.types.input.cloudrunv2.JobTemplateTemplateContainerEnv[] =
    args.secretBindings.map((binding) => ({
      name: binding.envVarName,
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
      project: args.project,
      location: args.region,
      name: args.jobName,
      template: {
        parallelism: 1,
        taskCount: 1,
        template: {
          maxRetries: 0,
          serviceAccount: args.jobServiceAccountEmail,
          containers: [
            {
              image: args.imageUri,
              envs: [
                {
                  name: "TOGGL_ORGANIZATION_ID",
                  value: args.togglOrganizationId,
                },
                {
                  name: "TOGGL_WORKSPACE_ID",
                  value: args.togglWorkspaceId,
                },
                ...secretEnvs,
              ],
            },
          ],
        },
      },
    },
    {
      dependsOn: args.secretBindings.map((binding) => binding.iamMember),
    },
  );

  const schedulerInvokerIam = new gcp.cloudrunv2.JobIamMember("modggl-scheduler-invoker", {
    project: args.project,
    location: job.location,
    name: job.name,
    role: "roles/run.invoker",
    member: args.schedulerServiceAccountMember,
  });

  const makeExecutorIam = new gcp.cloudrunv2.JobIamMember("modggl-make-executor", {
    project: args.project,
    location: job.location,
    name: job.name,
    role: "roles/run.jobsExecutorWithOverrides",
    member: args.makeExecutorMember,
  });

  return {
    job,
    schedulerInvokerIam,
    makeExecutorIam,
  };
};
