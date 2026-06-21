export type SharedProjectType = "chart" | "table";
export type SharedSharePermission = "read" | "edit";

export interface SharedProjectDto<TData = Record<string, unknown>> {
  id: string;
  type: SharedProjectType;
  name: string;
  schemaVersion: 1;
  data: TData;
  createdAt: string;
  updatedAt: string;
}

export interface SharedDraftDto<TData = Record<string, unknown>> {
  id: string;
  type: "chart-draft" | "table-draft";
  projectId?: string;
  schemaVersion: 1;
  data: TData;
  createdAt: string;
  updatedAt: string;
}

export interface SharedSessionDto {
  sessionId: string;
  token: string;
  createdAt: string;
}

export interface SharedProjectShareDto<TData = Record<string, unknown>> {
  id: string;
  token?: string;
  permission: SharedSharePermission;
  expiresAt?: string;
  project: SharedProjectDto<TData>;
}
