// import bcrypt from "bcrypt";

import { TPermissionServiceFactory } from "@app/ee/services/permission/permission-service";
import { BadRequestError, UnauthorizedError } from "@app/lib/errors";

import { TOrgDALFactory } from "../org/org-dal";
import { TUserSecretsDALFactory } from "./user-secrets-dal";
import { TCreateUserSecretDTO, TDeleteUserSecretDTO, TGetUserSecretsDTO } from "./user-secrets-type";

type TUserSecretsServiceFactoryDep = {
  permissionService: Pick<TPermissionServiceFactory, "getOrgPermission">;
  userSecretsDAL: TUserSecretsDALFactory;
  orgDAL: TOrgDALFactory;
};

export type TUserSecretsServiceFactory = ReturnType<typeof userSecretsServiceFactory>;

// TODO @danicunhac: add user secret update
export const userSecretsServiceFactory = ({ permissionService, userSecretsDAL }: TUserSecretsServiceFactoryDep) => {
  const createUserSecret = async ({
    actor,
    actorId,
    orgId,
    actorAuthMethod,
    actorOrgId,
    encryptedValue,
    hashedHex,
    iv,
    tag,
    name // secretType,
  }: TCreateUserSecretDTO) => {
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new UnauthorizedError({ name: "User not in org" });

    // Limit Input ciphertext length to 13000 (equivalent to 10,000 characters of Plaintext)
    if (encryptedValue.length > 13000) {
      throw new BadRequestError({ message: "User secret value too long" });
    }

    const newUserSecret = await userSecretsDAL.create({
      name,
      encryptedValue,
      hashedHex,
      iv,
      tag,
      userId: actorId,
      orgId
    });

    return { id: newUserSecret.id };
  };

  const getUserSecrets = async ({ actor, actorId, actorAuthMethod, actorOrgId, offset, limit }: TGetUserSecretsDTO) => {
    if (!actorOrgId) throw new BadRequestError({ message: "Failed to create group without organization" });

    const { permission } = await permissionService.getOrgPermission(
      actor,
      actorId,
      actorOrgId,
      actorAuthMethod,
      actorOrgId
    );
    if (!permission) throw new UnauthorizedError({ name: "User not in org" });

    const secrets = await userSecretsDAL.find(
      {
        userId: actorId,
        orgId: actorOrgId
      },
      { offset, limit, sort: [["createdAt", "desc"]] }
    );

    const count = await userSecretsDAL.countAllUserOrgSecrets({
      orgId: actorOrgId,
      userId: actorId
    });

    return {
      secrets,
      totalCount: count
    };
  };

  const deleteUserSecretById = async (deleteUserSecretInput: TDeleteUserSecretDTO) => {
    const { actor, actorId, orgId, actorAuthMethod, actorOrgId, userSecretId } = deleteUserSecretInput;
    const { permission } = await permissionService.getOrgPermission(actor, actorId, orgId, actorAuthMethod, actorOrgId);
    if (!permission) throw new UnauthorizedError({ name: "User not in org" });
    const deletedUserSecret = await userSecretsDAL.deleteById(userSecretId);
    return deletedUserSecret;
  };

  return {
    createUserSecret,
    getUserSecrets,
    deleteUserSecretById
  };
};
