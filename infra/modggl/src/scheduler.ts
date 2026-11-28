import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

/**
 * Cloud Scheduler ジョブ作成パラメータ
 */
export interface SchedulerJobParams {
  readonly project: string;
  readonly region: string;
  readonly schedulerJobName: string;
  readonly schedule: string;
  readonly timeZone: string;
  readonly cloudRunJobName: pulumi.Input<string>;
  readonly schedulerServiceAccountEmail: pulumi.Input<string>;
  readonly dependsOn?: readonly pulumi.Resource[];
}

/**
 * 作成された Cloud Scheduler リソースと実行エンドポイント URI
 */
export interface SchedulerJobResources {
  readonly schedulerJob: gcp.cloudscheduler.Job;
  readonly jobRunUri: pulumi.Output<string>;
}

/**
 * Cloud Run Job を定期起動する Cloud Scheduler ジョブを作成する
 * @param params - スケジュールおよびターゲットジョブ設定
 * @returns スケジューラジョブと実行 URI
 */
export const createSchedulerJob = (params: SchedulerJobParams): SchedulerJobResources => {
  const jobRunUri = pulumi.interpolate`https://run.googleapis.com/v2/projects/${params.project}/locations/${params.region}/jobs/${params.cloudRunJobName}:run`;

  const schedulerJob = new gcp.cloudscheduler.Job(
    "modggl-scheduler-job",
    {
      project: params.project,
      region: params.region,
      name: params.schedulerJobName,
      description: "Daily scheduled trigger for modggl 2.0 Cloud Run Job",
      schedule: params.schedule,
      timeZone: params.timeZone,
      retryConfig: {
        retryCount: 0,
      },
      httpTarget: {
        httpMethod: "POST",
        uri: jobRunUri,
        oauthToken: {
          serviceAccountEmail: params.schedulerServiceAccountEmail,
        },
      },
    },
    params.dependsOn ? { dependsOn: [...params.dependsOn] } : undefined,
  );

  return {
    schedulerJob: schedulerJob,
    jobRunUri: jobRunUri,
  };
};
