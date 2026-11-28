import * as pulumi from "@pulumi/pulumi";

import { createServiceAccounts } from "./iam";
import { createCloudRunJob } from "./job";
import { createDockerRepository } from "./registry";
import { createSchedulerJob } from "./scheduler";
import { createSecrets } from "./secrets";

const gcpConfig = new pulumi.Config("gcp");
const appConfig = new pulumi.Config("modggl");

const project = gcpConfig.require("project");
const region = gcpConfig.get("region") ?? "asia-northeast1";
const imageTag = appConfig.get("imageTag") ?? "latest";
const togglOrganizationId = appConfig.require("togglOrganizationId");
const togglWorkspaceId = appConfig.require("togglWorkspaceId");
const makeExecutorMember = appConfig.require("makeExecutorMember");
const schedule = appConfig.get("schedule") ?? "0 5 * * *";
const timeZone = appConfig.get("timeZone") ?? "Asia/Tokyo";

const registry = createDockerRepository({
  project,
  region,
  repositoryId: "modggl",
  imageName: "modggl",
  imageTag,
});

const serviceAccounts = createServiceAccounts({ project });

const secrets = createSecrets({
  project,
  jobServiceAccountMember: serviceAccounts.jobServiceAccount.member,
});

const secretBindings = [secrets.togglApiTokenBinding, secrets.discordWebhookUrlBinding];

const cloudRun = createCloudRunJob({
  project,
  region,
  jobName: "modggl",
  imageUri: registry.imageUri,
  togglOrganizationId,
  togglWorkspaceId,
  jobServiceAccountEmail: serviceAccounts.jobServiceAccount.email,
  schedulerServiceAccountMember: serviceAccounts.schedulerServiceAccount.member,
  makeExecutorMember,
  secretBindings,
});

const scheduler = createSchedulerJob({
  project,
  region,
  schedule,
  timeZone,
  cloudRunJobName: cloudRun.job.name,
  schedulerServiceAccountEmail: serviceAccounts.schedulerServiceAccount.email,
  dependsOn: [cloudRun.schedulerInvokerIam],
});

export const artifactRegistryUrl = registry.repository.registryUri;
export const containerImageUri = registry.imageUri;
export const cloudRunJobName = cloudRun.job.name;
export const cloudRunJobId = cloudRun.job.id;
export const cloudRunJobRunUri = scheduler.jobRunUri;
export const cloudSchedulerJobName = scheduler.schedulerJob.name;
export const jobServiceAccountEmail = serviceAccounts.jobServiceAccount.email;
export const schedulerServiceAccountEmail = serviceAccounts.schedulerServiceAccount.email;
export const togglApiTokenSecretId = secrets.togglApiTokenSecret.secretId;
export const discordWebhookUrlSecretId = secrets.discordWebhookUrlSecret.secretId;
