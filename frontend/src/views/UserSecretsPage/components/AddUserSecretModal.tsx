import { Modal, ModalContent } from "@app/components/v2";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserSecretForm } from "./UserSecretForm";

type Props = {
  popUp: UsePopUpState<["createUserSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createUserSecret"]>,
    state?: boolean
  ) => void;
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["createUserSecret" | "updateUserSecret"]>
  ) => void;
};

export const AddUserSecretModal = ({ popUp, handlePopUpToggle, handlePopUpClose }: Props) => {
  return (
    <Modal
      isOpen={popUp?.createUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("createUserSecret", isOpen);
      }}
    >
      <ModalContent title="Add a Secret">
        <UserSecretForm handlePopUpClose={handlePopUpClose} />
      </ModalContent>
    </Modal>
  );
};
