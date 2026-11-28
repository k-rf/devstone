import * as gcp from "@pulumi/gcp";

/**
 * サービスアカウント作成パラメータ
 */
export interface ServiceAccountsParams {
  readonly project: string;
  readonly namePrefix: string;
}

/**
 * 作成されたサービスアカウントリソース群
 */
export interface ServiceAccountsResources {
  readonly jobServiceAccount: gcp.serviceaccount.Account;
  readonly schedulerServiceAccount: gcp.serviceaccount.Account;
}

/**
 * Cloud Run Job 実行用と Cloud Scheduler 起動用のサービスアカウントを作成する
 * @param params - プロジェクトとリソース名プレフィックス
 * @returns 作成されたサービスアカウント群
 */
export const createServiceAccounts = (params: ServiceAccountsParams): ServiceAccountsResources => {
  const jobAccountId = `${params.namePrefix}-job-sa`;
  const schedulerAccountId = `${params.namePrefix}-scheduler-sa`;

  const jobServiceAccount = new gcp.serviceaccount.Account("modggl-job-sa", {
    project: params.project,
    accountId: jobAccountId,
    displayName: "modggl Cloud Run Job Service Account",
    description: "Runtime service account for the modggl 2.0 Cloud Run Job",
  });

  const schedulerServiceAccount = new gcp.serviceaccount.Account("modggl-scheduler-sa", {
    project: params.project,
    accountId: schedulerAccountId,
    displayName: "modggl Cloud Scheduler Service Account",
    description: "OAuth service account used by Cloud Scheduler to invoke modggl Cloud Run Job",
  });

  return {
    jobServiceAccount: jobServiceAccount,
    schedulerServiceAccount: schedulerServiceAccount,
  };
};
