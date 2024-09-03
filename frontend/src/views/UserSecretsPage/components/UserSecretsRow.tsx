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
    popUpName: keyof UsePopUpState<["deleteUserSecretConfirmation"]>,
    {
      name,
      id
    }: {
      name: string;
      id: string;
    }
  ) => void;
}) => {
  return (
    <Tr
      key={row.id}
      className="h-10 cursor-pointer transition-colors duration-300 hover:bg-mineshaft-700"
    >
      <Td>{row.name ? `${row.name}` : "-"}</Td>
      {/* <Td>
        <Badge variant={isExpired ? "danger" : "success"}>{isExpired ? "Expired" : "Active"}</Badge>
      </Td> */}
      <Td>{`${format(new Date(row.createdAt), "yyyy-MM-dd - HH:mm a")}`}</Td>
      {/* <Td>{format(new Date(row.expiresAt), "yyyy-MM-dd - HH:mm a")}</Td>
      <Td>{row.expiresAfterViews !== null ? row.expiresAfterViews : "-"}</Td> */}
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
