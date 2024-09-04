import { Knex } from "knex";

import { TableName } from "../schemas";
import { createOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TableName.UserSecrets))) {
    await knex.schema.createTable(TableName.UserSecrets, (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.string("name").notNullable();
      t.text("encryptedValue").notNullable();
      t.text("iv").notNullable();
      t.text("tag").notNullable();
      t.text("hashedHex").notNullable();
      t.uuid("userId").notNullable();
      t.uuid("orgId").notNullable();
      t.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
      t.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
      t.timestamps(true, true, true);
    });

    await createOnUpdateTrigger(knex, TableName.UserSecrets);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.UserSecrets);
}
