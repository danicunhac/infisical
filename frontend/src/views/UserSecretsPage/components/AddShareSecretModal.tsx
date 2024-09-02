import { Modal, ModalContent } from "@app/components/v2";
import { UsePopUpState } from "@app/hooks/usePopUp";
import { ShareSecretForm } from "@app/views/ShareSecretPublicPage/components";

type Props = {
  popUp: UsePopUpState<["createSharedSecret"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createSharedSecret"]>,
    state?: boolean
  ) => void;
};

export const AddUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  return (
    <Modal
      isOpen={popUp?.createSharedSecret?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("createSharedSecret", isOpen);
      }}
    >
      <ModalContent
        title="Add a Secret"
        // TODO @danicunhac: Add a nice subtitle
        // subTitle="Once you share a secret, the share link is only accessible once."
      >
        <ShareSecretForm
          isPublic={false}
          value={(popUp.createSharedSecret.data as { value?: string })?.value}
        />
      </ModalContent>
    </Modal>
  );
};
