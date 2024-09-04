import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { userSecretsKeys } from "./queries";
import { TCreateUserSecretRequest, TDeleteUserSecretRequest, TUserSecret } from "./types";

export const useCreateUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TCreateUserSecretRequest) => {
      const { data } = await apiRequest.post<TUserSecret>("/api/v1/user-secret", inputData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretsKeys.allUserSecrets())
  });
};

export const useUpdateUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputData: TCreateUserSecretRequest) => {
      const { data } = await apiRequest.post<TUserSecret>("/api/v1/user-secret", inputData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretsKeys.allUserSecrets())
  });
};

export const useDeleteUserSecret = () => {
  const queryClient = useQueryClient();
  return useMutation<TUserSecret, { message: string }, { userSecretId: string }>({
    mutationFn: async ({ userSecretId }: TDeleteUserSecretRequest) => {
      const { data } = await apiRequest.delete<TUserSecret>(`/api/v1/user-secret/${userSecretId}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(userSecretsKeys.allUserSecrets())
  });
};