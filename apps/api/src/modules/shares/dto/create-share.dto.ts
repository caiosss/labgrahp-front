import { IsDateString, IsIn, IsOptional } from "class-validator";

export class CreateShareDto {
  @IsIn(["read", "edit"])
  @IsOptional()
  permission?: "read" | "edit";

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
