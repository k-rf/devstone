import * as gcp from "@pulumi/gcp";
import { type Input, type Output } from "@pulumi/pulumi";

/**
 * Secret Manager リソース作成パラメータ
 */
export interface SecretsParams {
  readonly project: string;
  readonly namePrefix: string;
  readonly jobServiceAccountMember: Input<string>;
}

/**
 * Cloud Run Job コンテナへ渡すシークレット参照情報
 */
export interface SecretEnvironmentBinding {
  readonly environmentVariableName: string;
  readonly secretId: Output<string>;
  readonly iamMember: gcp.secretmanager.SecretIamMember;
}

/**
 * 作成された Secret Manager リソース群
 */
export interface SecretsResources {
  readonly togglApiTokenSecret: gcp.secretmanager.Secret;
  readonly togglApiTokenBinding: SecretEnvironmentBinding;
  readonly discordWebhookUrlSecret: gcp.secretmanager.Secret;
  readonly discordWebhookUrlBinding: SecretEnvironmentBinding;
}

const createSecretWithAccessor = (
  resourcePrefix: string,
  project: string,
  secretId: string,
  environmentVariableName: string,
  jobServiceAccountMember: Input<string>,
): {
  readonly secret: gcp.secretmanager.Secret;
  readonly binding: SecretEnvironmentBinding;
} => {
  const secret = new gcp.secretmanager.Secret(resourcePrefix, {
    project: project,
    secretId: secretId,
    replication: {
      auto: {},
    },
  });

  const iamMember = new gcp.secretmanager.SecretIamMember(`${resourcePrefix}-accessor`, {
    project: project,
    secretId: secret.id,
    role: "roles/secretmanager.secretAccessor",
    member: jobServiceAccountMember,
  });

  return {
    secret: secret,
    binding: {
      environmentVariableName: environmentVariableName,
      secretId: secret.secretId,
      iamMember: iamMember,
    },
  };
};

/**
 * Toggl API トークンと Discord Webhook URL の Secret Manager コンテナおよび参照権限を作成する
 * @param params - プロジェクト・プレフィックス・アクセス権限を付与するサービスアカウント
 * @returns 作成されたシークレットとバインディング情報
 */
export const createSecrets = (params: SecretsParams): SecretsResources => {
  const togglToken = createSecretWithAccessor(
    "toggl-api-token",
    params.project,
    `${params.namePrefix}-toggl-api-token`,
    "TOGGL_API_TOKEN",
    params.jobServiceAccountMember,
  );

  const discordWebhook = createSecretWithAccessor(
    "discord-webhook-url",
    params.project,
    `${params.namePrefix}-discord-webhook-url`,
    "DISCORD_WEBHOOK_URL",
    params.jobServiceAccountMember,
  );

  return {
    togglApiTokenSecret: togglToken.secret,
    togglApiTokenBinding: togglToken.binding,
    discordWebhookUrlSecret: discordWebhook.secret,
    discordWebhookUrlBinding: discordWebhook.binding,
  };
};
