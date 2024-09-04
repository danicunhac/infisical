import { Knex } from "knex";

import { TDbClient } from "@app/db";
import { TableName, TUserSecrets } from "@app/db/schemas";
import { DatabaseError } from "@app/lib/errors";
import { ormify, selectAllTableCols } from "@app/lib/knex";

export type TUserSecretsDALFactory = ReturnType<typeof userSecretsDALFactory>;

export const userSecretsDALFactory = (db: TDbClient) => {
  const userSecretOrm = ormify(db, TableName.UserSecrets);

  const countAllUserOrgSecrets = async ({ orgId, userId }: { orgId: string; userId: string }) => {
    try {
      interface CountResult {
        count: string;
      }

      const count = await db
        .replicaNode()(TableName.UserSecrets)
        .where(`${TableName.UserSecrets}.orgId`, orgId)
        .where(`${TableName.UserSecrets}.userId`, userId)
        .count("*")
        .first();

      return parseInt((count as unknown as CountResult).count || "0", 10);
    } catch (error) {
      throw new DatabaseError({ error, name: "Count all user-org secrets" });
    }
  };

  const findUserSecrets = async (filters: Partial<TUserSecrets>, tx?: Knex) => {
    try {
      return await (tx || db)(TableName.UserSecrets)
        .where(filters)
        .andWhere("encryptedValue", "<>", "")
        .select(selectAllTableCols(TableName.UserSecrets));
    } catch (error) {
      throw new DatabaseError({
        error,
        name: "Find User Secrets"
      });
    }
  };

  const softDeleteById = async (id: string) => {
    try {
      await userSecretOrm.updateById(id, {
        encryptedValue: "",
        iv: "",
        tag: ""
      });
    } catch (error) {
      throw new DatabaseError({
        error,
        name: "Soft Delete User Secret"
      });
    }
  };

  return {
    ...userSecretOrm,
    countAllUserOrgSecrets,
    softDeleteById,
    findUserSecrets
  };
};
