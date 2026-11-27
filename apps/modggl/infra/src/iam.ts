import * as gcp from "@pulumi/gcp";

export interface ServiceAccountsArgs {
  readonly project: string;
}

export interface ServiceAccountsResources {
  readonly jobServiceAccount: gcp.serviceaccount.Account;
  readonly schedulerServiceAccount: gcp.serviceaccount.Account;
}

export const createServiceAccounts = (args: ServiceAccountsArgs): ServiceAccountsResources => {
  const jobServiceAccount = new gcp.serviceaccount.Account("modggl-job-sa", {
    project: args.project,
    accountId: "modggl-job-sa",
    displayName: "modggl Cloud Run Job Service Account",
    description: "Runtime service account for the modggl 2.0 Cloud Run Job",
  });

  const schedulerServiceAccount = new gcp.serviceaccount.Account("modggl-scheduler-sa", {
    project: args.project,
    accountId: "modggl-scheduler-sa",
    displayName: "modggl Cloud Scheduler Service Account",
    description: "OAuth service account used by Cloud Scheduler to invoke modggl Cloud Run Job",
  });

  return {
    jobServiceAccount,
    schedulerServiceAccount,
  };
};
