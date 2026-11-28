import * as pulumi from "@pulumi/pulumi";

import { createServiceAccounts } from "./iam.js";
import { createCloudRunJob } from "./job.js";
import { createDockerRepository } from "./registry.js";
import { createSchedulerJob } from "./scheduler.js";
import { createSecrets } from "./secrets.js";

/**
 * modggl 2.0 用の GCP インフラ（Artifact Registry / Secret Manager / Cloud Run Jobs / Cloud Scheduler）を構築し、
 * スタック出力オブジェクトを返却する
 * @returns Pulumi スタック出力
 */
const deployModgglInfra = () => {
  const gcpConfig = new pulumi.Config("gcp");
  const appConfig = new pulumi.Config("modggl");

  const stack = pulumi.getStack();
  const project = gcpConfig.require("project");
  const region = gcpConfig.get("region") ?? "asia-northeast1";
  const imageTag = appConfig.require("imageTag");
  const togglOrganizationId = appConfig.require("togglOrganizationId");
  const togglWorkspaceId = appConfig.require("togglWorkspaceId");
  const makeExecutorMember = appConfig.require("makeExecutorMember");
  const schedule = appConfig.get("schedule") ?? "0 5 * * *";
  const timeZone = appConfig.get("timeZone") ?? "Asia/Tokyo";
  const namePrefix =
    appConfig.get("resourcePrefix") ?? (stack === "production" ? "modggl" : `modggl-${stack}`);

  const registry = createDockerRepository({
    project: project,
    region: region,
    repositoryId: namePrefix,
    imageName: "modggl",
    imageTag: imageTag,
  });

  const serviceAccounts = createServiceAccounts({
    project: project,
    namePrefix: namePrefix,
  });

  const secrets = createSecrets({
    project: project,
    namePrefix: namePrefix,
    jobServiceAccountMember: serviceAccounts.jobServiceAccount.member,
  });

  const secretBindings = [secrets.togglApiTokenBinding, secrets.discordWebhookUrlBinding];

  const cloudRun = createCloudRunJob({
    project: project,
    region: region,
    jobName: namePrefix,
    imageUri: registry.imageUri,
    togglOrganizationId: togglOrganizationId,
    togglWorkspaceId: togglWorkspaceId,
    jobServiceAccountEmail: serviceAccounts.jobServiceAccount.email,
    schedulerServiceAccountMember: serviceAccounts.schedulerServiceAccount.member,
    makeExecutorMember: makeExecutorMember,
    secretBindings: secretBindings,
  });

  const scheduler = createSchedulerJob({
    project: project,
    region: region,
    schedulerJobName: `${namePrefix}-daily-run`,
    schedule: schedule,
    timeZone: timeZone,
    cloudRunJobName: cloudRun.job.name,
    schedulerServiceAccountEmail: serviceAccounts.schedulerServiceAccount.email,
    dependsOn: [cloudRun.schedulerExecutorIam],
  });

  return {
    artifactRegistryUrl: registry.repository.registryUri,
    containerImageUri: registry.imageUri,
    cloudRunJobName: cloudRun.job.name,
    cloudRunJobId: cloudRun.job.id,
    cloudRunJobRunUri: scheduler.jobRunUri,
    cloudSchedulerJobName: scheduler.schedulerJob.name,
    jobServiceAccountEmail: serviceAccounts.jobServiceAccount.email,
    schedulerServiceAccountEmail: serviceAccounts.schedulerServiceAccount.email,
    togglApiTokenSecretId: secrets.togglApiTokenSecret.secretId,
    discordWebhookUrlSecretId: secrets.discordWebhookUrlSecret.secretId,
  };
};

export default deployModgglInfra;
