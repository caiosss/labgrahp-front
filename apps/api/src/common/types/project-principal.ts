export type ProjectPrincipal =
  | {
      type: "anonymous";
      sessionId: string;
    }
  | {
      type: "identity";
      userId: string;
    };

export const isProjectOwnedBy = (
  project: { ownerSessionId: string | null; ownerUserId: string | null },
  principal: ProjectPrincipal,
) =>
  principal.type === "identity"
    ? project.ownerUserId === principal.userId
    : project.ownerSessionId === principal.sessionId;
