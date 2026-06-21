import { IsIn, IsInt, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class UpsertProjectDto {
  @IsIn(["chart", "table"])
  type!: "chart" | "table";

  @IsString()
  name!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @IsInt()
  @Min(1)
  @Max(1)
  @IsOptional()
  schemaVersion?: 1;
}
