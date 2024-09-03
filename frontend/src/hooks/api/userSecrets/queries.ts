import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { TUserSecret, TViewUserSecretResponse } from "./types";

export const userSecretsKeys = {
  allUserSecrets: () => ["userSecrets"] as const,
  specificUserSecrets: ({ offset, limit }: { offset: number; limit: number }) =>
    [...userSecretsKeys.allUserSecrets(), { offset, limit }] as const,
  getSecretById: (arg: { id: string; hashedHex: string; password?: string }) => [
    "shared-secret",
    arg
  ]
};

export const useGetUserSecrets = ({
  offset = 0,
  limit = 25
}: {
  offset: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: userSecretsKeys.specificUserSecrets({ offset, limit }),
    queryFn: async () => {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(limit)
      });

      const { data } = await apiRequest.get<{ secrets: TUserSecret[]; totalCount: number }>(
        "/api/v1/user-secret/",
        {
          params
        }
      );
      return data;
    }
  });
};

export const useGetUserSecretById = ({
  userSecretId,
  hashedHex,
  password
}: {
  userSecretId: string;
  hashedHex: string;
  password?: string;
}) => {
  return useQuery<TViewUserSecretResponse>(
    userSecretsKeys.getSecretById({ id: userSecretId, hashedHex, password }),
    async () => {
      const { data } = await apiRequest.post<TViewUserSecretResponse>(
        `/api/v1/user-secret/${userSecretId}`,
        {
          hashedHex,
          password
        }
      );

      return data;
    },
    {
      enabled: Boolean(userSecretId) && Boolean(hashedHex)
    }
  );
};
