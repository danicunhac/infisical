import { Modal, ModalContent } from "@app/components/v2";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserSecretForm } from "./UserSecretForm";

type Props = {
  popUp: UsePopUpState<["createUserSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createUserSecret"]>,
    state?: boolean
  ) => void;
};

export const AddUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  return (
    <Modal
      isOpen={popUp?.createUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("createUserSecret", isOpen);
      }}
    >
      <ModalContent
        title="Add a Secret"
        // TODO @danicunhac: Add a nice subtitle
        // subTitle="Once you share a secret, the share link is only accessible once."
      >
        <UserSecretForm
        // value={(popUp.createSharedSecret.data as { value?: string })?.value}
        />
      </ModalContent>
    </Modal>
  );
};
