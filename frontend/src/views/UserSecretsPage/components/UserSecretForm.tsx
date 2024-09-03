import crypto from "crypto";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { faCheck, faCopy, faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import { encryptSymmetric } from "@app/components/utilities/cryptography/crypto";
import { Button, FormControl, IconButton, Input, Select, SelectItem } from "@app/components/v2";
import { useTimedReset } from "@app/hooks";
import { useCreateUserSecret } from "@app/hooks/api";
import { UserSecretType } from "@app/hooks/api/userSecrets";
// TODO @danicunhac: add UserSecretType to @app/hooks/api/userSecrets
// import { SecretSharingAccessType } from "@app/hooks/api/secretSharing";

// TODO @danicunhac: use this enum to determine the type of secret

const schema = z.object({
  name: z.string().optional(),
  username: z.string().min(1).optional(),
  password: z.string().optional(),
  // TODO @danicunhac: add optional properties for CreditCard and SecureNote
  secretType: z.nativeEnum(UserSecretType).optional()
});

export type FormData = z.infer<typeof schema>;

export const UserSecretForm = () => {
  const [secretLink, setSecretLink] = useState("");
  const [, isCopyingSecret, setCopyTextSecret] = useTimedReset<string>({
    initialState: "Copy to clipboard"
  });

  const createUserSecret = useCreateUserSecret();

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {}
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
          plaintext: password,
          key
        });

        // const { id } =
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

      setCopyTextSecret("secret");
      createNotification({
        text: "Successfully created a user secret",
        type: "success"
      });
    } catch (error) {
      console.error(error);
      createNotification({
        text: "Failed to create a user secret",
        type: "error"
      });
    }
  };

  const hasSecretLink = Boolean(secretLink);

  return !hasSecretLink ? (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState: { error } }) => (
          <FormControl label="Name (Optional)" isError={Boolean(error)} errorText={error?.message}>
            <Input {...field} placeholder="Resend Creds" type="text" />
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
              <SelectItem value={UserSecretType.CreditCard}>Credit Card</SelectItem>
              <SelectItem value={UserSecretType.SecureNote}>Secure Note</SelectItem>
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
        Save secret
      </Button>
    </form>
  ) : (
    <>
      <div className="mr-2 flex items-center justify-end rounded-md bg-white/[0.05] p-2 text-base text-gray-400">
        <p className="mr-4 break-all">{secretLink}</p>
        <IconButton
          ariaLabel="copy icon"
          colorSchema="secondary"
          className="group relative ml-2"
          onClick={() => {
            navigator.clipboard.writeText(secretLink);
            setCopyTextSecret("Copied");
          }}
        >
          <FontAwesomeIcon icon={isCopyingSecret ? faCheck : faCopy} />
        </IconButton>
      </div>
      <Button
        className="mt-4 w-full bg-mineshaft-700 py-3 text-bunker-200"
        colorSchema="primary"
        variant="outline_bg"
        size="sm"
        onClick={() => setSecretLink("")}
        rightIcon={<FontAwesomeIcon icon={faRedo} className="pl-2" />}
      >
        Share another secret
      </Button>
    </>
  );
};
