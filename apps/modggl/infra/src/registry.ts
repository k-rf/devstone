import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

export interface DockerRegistryArgs {
  readonly project: string;
  readonly region: string;
  readonly repositoryId: string;
  readonly imageName: string;
  readonly imageTag: string;
}

export interface DockerRegistryResources {
  readonly repository: gcp.artifactregistry.Repository;
  readonly imageUri: pulumi.Output<string>;
}

export const createDockerRepository = (args: DockerRegistryArgs): DockerRegistryResources => {
  const repository = new gcp.artifactregistry.Repository("modggl-repository", {
    project: args.project,
    location: args.region,
    repositoryId: args.repositoryId,
    format: "DOCKER",
    description: "Docker repository for modggl 2.0 batch CLI",
  });

  const imageUri = pulumi.interpolate`${repository.registryUri}/${args.imageName}:${args.imageTag}`;

  return {
    repository,
    imageUri,
  };
};
