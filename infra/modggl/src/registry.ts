import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

/**
 * Artifact Registry Docker リポジトリ作成パラメータ
 */
export interface DockerRegistryParams {
  readonly project: string;
  readonly region: string;
  readonly repositoryId: string;
  readonly imageName: string;
  readonly imageTag: string;
}

/**
 * 作成された Artifact Registry リソースとイメージ URI
 */
export interface DockerRegistryResources {
  readonly repository: gcp.artifactregistry.Repository;
  readonly imageUri: pulumi.Output<string>;
}

/**
 * Docker コンテナ用の Artifact Registry リポジトリを作成し、参照 URI を組み立てる
 * @param params - リポジトリ設定とイミュータブルタグまたは digest
 * @returns リポジトリとイメージ URI
 */
export const createDockerRepository = (params: DockerRegistryParams): DockerRegistryResources => {
  const repository = new gcp.artifactregistry.Repository("modggl-repository", {
    project: params.project,
    location: params.region,
    repositoryId: params.repositoryId,
    format: "DOCKER",
    description: "Docker repository for modggl 2.0 batch CLI",
  });

  const separator = params.imageTag.startsWith("sha256:") ? "@" : ":";
  const imageUri = pulumi.interpolate`${repository.registryUri}/${params.imageName}${separator}${params.imageTag}`;

  return {
    repository: repository,
    imageUri: imageUri,
  };
};
