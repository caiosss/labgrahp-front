import { SharePermission } from "@prisma/client";

export const normalizeSharePermission = (permission?: "read" | "edit") => {
  if (permission === "edit") {
    return SharePermission.EDIT;
  }

  return SharePermission.READ;
};

export const serializeSharePermission = (permission: SharePermission) => {
  if (permission === SharePermission.EDIT) {
    return "edit";
  }

  return "read";
};
