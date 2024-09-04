import crypto from "crypto";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { encryptSymmetric } from "@app/components/utilities/cryptography/crypto";
import { Button, FormControl, Input, Select, SelectItem } from "@app/components/v2";
import { useCreateUserSecret } from "@app/hooks/api";
import { UserSecretType } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

const schema = z.object({
  name: z.string().optional(),
  username: z.string().min(1).optional(),
  password: z.string().optional(),
  // TODO @danicunhac: add optional properties for CreditCard and SecureNote
  secretType: z.nativeEnum(UserSecretType).optional()
});

export type FormData = z.infer<typeof schema>;

type Props = {
  row?: FormData;
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["createUserSecret", "updateUserSecret"]>
  ) => void;
};

export const UserSecretForm = ({ handlePopUpClose, row }: Props) => {
  const createUserSecret = useCreateUserSecret();

  const isUpdateForm = useMemo(() => Boolean(row), [row]);

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...row
    }
  });

  const onFormSubmit = async ({ name, username, password, secretType }: FormData) => {
    try {
      const key = crypto.randomBytes(16).toString("hex");
      const hashedHex = crypto.createHash("sha256").update(key).digest("hex");

      if (!secretType) {
        throw new Error("Secret type is required");
      }

      if (secretType === UserSecretType.Credentials) {
        if (!username) {
          throw new Error("Username is required");
        }

        if (!password) {
          throw new Error("Password is required");
        }

        const { ciphertext, iv, tag } = encryptSymmetric({
          plaintext: JSON.stringify({ username, password }),
          key
        });

        await createUserSecret.mutateAsync({
          name,
          username,
          password,
          encryptedValue: ciphertext,
          hashedHex,
          iv,
          tag,
          secretType
        });
      }

      reset();

      createNotification({
        text: "Successfully created a user secret",
        type: "success"
      });
      handlePopUpClose("createUserSecret");
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to create a user secret",
        type: "error"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <FormControl label="Name (Optional)" isError={Boolean(error)} errorText={error?.message}>
            <Input {...field} placeholder="Resend" type="text" />
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="secretType"
        defaultValue={UserSecretType.Credentials}
        render={({ field: { onChange, ...field }, fieldState: { error } }) => (
          <FormControl label="Secret Type" errorText={error?.message} isError={Boolean(error)}>
            <Select
              defaultValue={field.value}
              {...field}
              onValueChange={(e) => onChange(e)}
              className="w-full"
            >
              <SelectItem value={UserSecretType.Credentials}>Credentials</SelectItem>
              {/* <SelectItem value={UserSecretType.CreditCard}>Credit Card</SelectItem>
              <SelectItem value={UserSecretType.SecureNote}>Secure Note</SelectItem> */}
            </Select>
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name="username"
        render={({ field, fieldState: { error } }) => (
          <FormControl
            label="Username"
            isError={Boolean(error)}
            errorText={error?.message}
            className="mb-2"
            isRequired
          >
            <Input {...field} placeholder="Username" type="username" />
          </FormControl>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState: { error } }) => (
          <FormControl
            label="Password"
            isError={Boolean(error)}
            errorText={error?.message}
            isRequired
          >
            <Input {...field} placeholder="Password" type="password" />
          </FormControl>
        )}
      />
      {/* 
        TODO @danicunhac: Add fields for different credential types
      */}
      <Button
        className="mt-4"
        size="sm"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        {isUpdateForm ? "Update secret" : "Save secret"}
      </Button>
    </form>
  );
};
