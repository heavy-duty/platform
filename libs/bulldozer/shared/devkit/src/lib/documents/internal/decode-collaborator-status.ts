type EncodedCollaboratorStatus = {
  [key: string]: { id: number };
};

interface DecodedCollaboratorStatus {
  id: number;
  name: string;
}

export const decodeCollaboratorStatus = (
  collaboratorStatus: EncodedCollaboratorStatus
): DecodedCollaboratorStatus => {
  const collaboratorStatusName = Object.keys(collaboratorStatus)[0];
  return {
    id: collaboratorStatus[collaboratorStatusName].id,
    name: collaboratorStatusName,
  };
};
