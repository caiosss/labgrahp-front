import { IsInt, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class UpsertDraftDto {
  @IsObject()
  data!: Record<string, unknown>;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsInt()
  @Min(1)
  @Max(1)
  @IsOptional()
  schemaVersion?: 1;
}
