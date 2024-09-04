// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";

import { TImmutableDBKeys } from "./models";

export const UserSecretsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  encryptedValue: z.string(),
  iv: z.string(),
  tag: z.string(),
  hashedHex: z.string(),
  userId: z.string().uuid(),
  orgId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TUserSecrets = z.infer<typeof UserSecretsSchema>;
export type TUserSecretsInsert = Omit<z.input<typeof UserSecretsSchema>, TImmutableDBKeys>;
export type TUserSecretsUpdate = Partial<Omit<z.input<typeof UserSecretsSchema>, TImmutableDBKeys>>;
