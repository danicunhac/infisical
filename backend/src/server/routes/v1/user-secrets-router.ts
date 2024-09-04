import { z } from "zod";

import { UserSecretsSchema } from "@app/db/schemas";
import { UserSecretType } from "@app/lib/types";
import { readLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

export const registerUserSecretsRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    schema: {
      querystring: z.object({
        offset: z.coerce.number().min(0).max(100).default(0),
        limit: z.coerce.number().min(1).max(100).default(25)
      }),
      response: {
        200: z.object({
          secrets: z.array(UserSecretsSchema),
          totalCount: z.number()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { secrets, totalCount } = await req.server.services.userSecrets.getUserSecrets({
        actor: req.permission.type,
        actorId: req.permission.id,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        ...req.query
      });

      return {
        secrets,
        totalCount
      };
    }
  });

  // TODO @danicunhac: Update User Secret
  // server.route({
  //   method: "POST",
  //   url: "/:id",
  //   config: {
  //     rateLimit: writeLimit
  //   },
  //   schema: {
  //     params: z.object({
  //       id: z.string().uuid()
  //     }),
  //     body: z.object({
  //       hashedHex: z.string().min(1),
  //       password: z.string().optional()
  //     }),
  //     response: {
  //       200: z.object({
  //         secret: UserSecretsSchema.pick({
  //           encryptedValue: true,
  //           iv: true,
  //           tag: true,
  //           secretType: true
  //         })
  //           .extend({
  //             orgName: z.string().optional()
  //           })
  //           .optional()
  //       })
  //     }
  //   },
  //   handler: async (req) => {
  //     const userSecret = await req.server.services.userSecrets.getUserSecretById({
  //       userSecretId: req.params.id,
  //       hashedHex: req.body.hashedHex,
  //       password: req.body.password,
  //       orgId: req.permission?.orgId
  //     });

  //     return userSecret;
  //   }
  // });

  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      body: z.object({
        name: z.string().max(50).optional(),
        password: z.string().optional(),
        encryptedValue: z.string(),
        hashedHex: z.string(),
        iv: z.string(),
        tag: z.string(),
        secretType: z.nativeEnum(UserSecretType).default(UserSecretType.Credentials)
      }),
      response: {
        200: z.object({
          id: z.string().uuid()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      console.info("🚀 ~ handler: ~ req:", req.server.services);
      const userSecret = await req.server.services.userSecrets.createUserSecret({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        ...req.body
      });
      return { id: userSecret.id };
    }
  });

  server.route({
    method: "DELETE",
    url: "/:userSecretId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      params: z.object({
        userSecretId: z.string().uuid()
      }),
      response: {
        200: UserSecretsSchema
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { userSecretId } = req.params;
      const deletedUserSecret = await req.server.services.userSecrets.deleteUserSecretById({
        actor: req.permission.type,
        actorId: req.permission.id,
        orgId: req.permission.orgId,
        actorAuthMethod: req.permission.authMethod,
        actorOrgId: req.permission.orgId,
        userSecretId
      });

      return { ...deletedUserSecret };
    }
  });
};
