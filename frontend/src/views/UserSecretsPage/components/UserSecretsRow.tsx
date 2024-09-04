import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";

import { IconButton, Td, Tr } from "@app/components/v2";
import { TUserSecret } from "@app/hooks/api/userSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

export const UserSecretsRow = ({
  row,
  handlePopUpOpen
}: {
  row: TUserSecret;
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<
      ["deleteUserSecretConfirmation", "createUserSecret", "updateUserSecret"]
    >,
    {
      name,
      id,
      row
    }: {
      name?: string;
      id?: string;
      row?: TUserSecret;
    }
  ) => void;
}) => {
  // TODO @danicunhac: Decrypt row value so we can send it to the form and display it in order to update

  return (
    <Tr
      key={row.id}
      className="h-10 cursor-pointer transition-colors duration-300 hover:bg-mineshaft-700"
      onClick={() => handlePopUpOpen("updateUserSecret", { row })}
    >
      <Td>{row.name ? `${row.name}` : "-"}</Td>
      <Td>Credentials</Td>
      <Td>{`${format(new Date(row.createdAt), "yyyy-MM-dd - HH:mm a")}`}</Td>
      <Td>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handlePopUpOpen("deleteUserSecretConfirmation", {
              name: "delete",
              id: row.id
            });
          }}
          variant="plain"
          ariaLabel="delete"
        >
          <FontAwesomeIcon icon={faTrash} />
        </IconButton>
      </Td>
    </Tr>
  );
};
