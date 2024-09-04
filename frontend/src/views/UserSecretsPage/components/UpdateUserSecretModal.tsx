import { Modal, ModalContent } from "@app/components/v2";
import { UserSecretType } from "@app/hooks/api";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserSecretForm } from "./UserSecretForm";

type Props = {
  popUp: UsePopUpState<["updateUserSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["updateUserSecret"]>,
    state?: boolean
  ) => void;
  handlePopUpClose: (
    popUpName: keyof UsePopUpState<["updateUserSecret" | "createUserSecret"]>
  ) => void;
};

export const UpdateUserSecretModal = ({ popUp, handlePopUpToggle, handlePopUpClose }: Props) => {
  return (
    <Modal
      isOpen={popUp?.updateUserSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("updateUserSecret", isOpen);
      }}
    >
      <ModalContent title="Update Secret">
        <UserSecretForm
          row={
            popUp.updateUserSecret?.data?.row as {
              name?: string;
              username?: string;
              password?: string;
              secretType?: UserSecretType;
            }
          }
          handlePopUpClose={handlePopUpClose}
        />
      </ModalContent>
    </Modal>
  );
};
