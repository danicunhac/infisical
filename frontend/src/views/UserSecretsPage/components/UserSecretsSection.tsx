import Head from "next/head";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { createNotification } from "@app/components/notifications";
import { Button, DeleteActionModal } from "@app/components/v2";
import { usePopUp } from "@app/hooks";
import { useDeleteSharedSecret } from "@app/hooks/api/secretSharing";

import { AddUserSecretModal } from "./AddUserSecretModal";
import { UserSecretsTable } from "./UserSecretsTable";

type DeleteModalData = { name: string; id: string };

export const UserSecretsSection = () => {
  const deleteSharedSecret = useDeleteSharedSecret();
  const { popUp, handlePopUpToggle, handlePopUpClose, handlePopUpOpen } = usePopUp([
    "createSharedSecret",
    "deleteSharedSecretConfirmation"
  ] as const);

  const onDeleteApproved = async () => {
    try {
      deleteSharedSecret.mutateAsync({
        sharedSecretId: (popUp?.deleteSharedSecretConfirmation?.data as DeleteModalData)?.id
      });
      createNotification({
        text: "Successfully deleted shared secret",
        type: "success"
      });

      handlePopUpClose("deleteSharedSecretConfirmation");
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to delete shared secret",
        type: "error"
      });
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <Head>
        <title>User Secrets</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
      </Head>
      <div className="mb-4 flex justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">Secrets</p>
        <Button
          colorSchema="primary"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => {
            handlePopUpOpen("createSharedSecret");
          }}
        >
          Add Secret
        </Button>
      </div>
      <UserSecretsTable handlePopUpOpen={handlePopUpOpen} />
      <AddUserSecretModal popUp={popUp} handlePopUpToggle={handlePopUpToggle} />
      <DeleteActionModal
        isOpen={popUp.deleteSharedSecretConfirmation.isOpen}
        title={`Delete ${
          (popUp?.deleteSharedSecretConfirmation?.data as DeleteModalData)?.name || " "
        } shared secret?`}
        onChange={(isOpen) => handlePopUpToggle("deleteSharedSecretConfirmation", isOpen)}
        deleteKey={(popUp?.deleteSharedSecretConfirmation?.data as DeleteModalData)?.name}
        onClose={() => handlePopUpClose("deleteSharedSecretConfirmation")}
        onDeleteApproved={onDeleteApproved}
      />
    </div>
  );
};
