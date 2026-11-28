import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

export interface SecretsArgs {
  readonly project: string;
  readonly jobServiceAccountMember: pulumi.Input<string>;
}

export interface SecretEnvBinding {
  readonly envVarName: string;
  readonly secretId: pulumi.Output<string>;
  readonly iamMember: gcp.secretmanager.SecretIamMember;
}

export interface SecretsResources {
  readonly togglApiTokenSecret: gcp.secretmanager.Secret;
  readonly togglApiTokenBinding: SecretEnvBinding;
  readonly discordWebhookUrlSecret: gcp.secretmanager.Secret;
  readonly discordWebhookUrlBinding: SecretEnvBinding;
}

const createSecretWithAccessor = (
  resourcePrefix: string,
  project: string,
  secretId: string,
  envVarName: string,
  jobServiceAccountMember: pulumi.Input<string>,
): {
  readonly secret: gcp.secretmanager.Secret;
  readonly binding: SecretEnvBinding;
} => {
  const secret = new gcp.secretmanager.Secret(resourcePrefix, {
    project,
    secretId,
    replication: {
      auto: {},
    },
  });

  const iamMember = new gcp.secretmanager.SecretIamMember(`${resourcePrefix}-accessor`, {
    project,
    secretId: secret.id,
    role: "roles/secretmanager.secretAccessor",
    member: jobServiceAccountMember,
  });

  return {
    secret,
    binding: {
      envVarName,
      secretId: secret.secretId,
      iamMember,
    },
  };
};

export const createSecrets = (args: SecretsArgs): SecretsResources => {
  const togglToken = createSecretWithAccessor(
    "toggl-api-token",
    args.project,
    "modggl-toggl-api-token",
    "TOGGL_API_TOKEN",
    args.jobServiceAccountMember,
  );

  const discordWebhook = createSecretWithAccessor(
    "discord-webhook-url",
    args.project,
    "modggl-discord-webhook-url",
    "DISCORD_WEBHOOK_URL",
    args.jobServiceAccountMember,
  );

  return {
    togglApiTokenSecret: togglToken.secret,
    togglApiTokenBinding: togglToken.binding,
    discordWebhookUrlSecret: discordWebhook.secret,
    discordWebhookUrlBinding: discordWebhook.binding,
  };
};
