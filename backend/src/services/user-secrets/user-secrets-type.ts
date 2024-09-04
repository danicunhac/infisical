import { TGenericPermission } from "@app/lib/types";

import { ActorAuthMethod, ActorType } from "../auth/auth-type";

export type TGetUserSecretsDTO = {
  offset: number;
  limit: number;
} & TGenericPermission;

export type TUserSecretPermission = {
  actor: ActorType;
  actorId: string;
  actorAuthMethod: ActorAuthMethod;
  actorOrgId: string;
  orgId: string;
  name?: string;
};

export type TCreateUserSecretDTO = {
  encryptedValue: string;
  hashedHex: string;
  iv: string;
  tag: string;
} & TUserSecretPermission;

export type TDeleteUserSecretDTO = {
  userSecretId: string;
} & TUserSecretPermission;
