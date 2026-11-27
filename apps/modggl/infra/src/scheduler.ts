import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

export interface SchedulerJobArgs {
  readonly project: string;
  readonly region: string;
  readonly schedule: string;
  readonly timeZone: string;
  readonly cloudRunJobName: pulumi.Input<string>;
  readonly schedulerServiceAccountEmail: pulumi.Input<string>;
  readonly dependsOn?: readonly pulumi.Resource[];
}

export interface SchedulerJobResources {
  readonly schedulerJob: gcp.cloudscheduler.Job;
  readonly jobRunUri: pulumi.Output<string>;
}

export const createSchedulerJob = (args: SchedulerJobArgs): SchedulerJobResources => {
  const jobRunUri = pulumi.interpolate`https://run.googleapis.com/v2/projects/${args.project}/locations/${args.region}/jobs/${args.cloudRunJobName}:run`;

  const schedulerJob = new gcp.cloudscheduler.Job(
    "modggl-scheduler-job",
    {
      project: args.project,
      region: args.region,
      name: "modggl-daily-run",
      description: "Daily scheduled trigger for modggl 2.0 Cloud Run Job",
      schedule: args.schedule,
      timeZone: args.timeZone,
      retryConfig: {
        retryCount: 0,
      },
      httpTarget: {
        httpMethod: "POST",
        uri: jobRunUri,
        oauthToken: {
          serviceAccountEmail: args.schedulerServiceAccountEmail,
        },
      },
    },
    args.dependsOn ? { dependsOn: [...args.dependsOn] } : undefined,
  );

  return {
    schedulerJob,
    jobRunUri,
  };
};
