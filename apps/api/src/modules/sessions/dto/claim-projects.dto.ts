import {
  IsNotEmpty,
  IsString,
} from "class-validator";

export class ClaimProjectsDto {
  @IsString()
  @IsNotEmpty()
  anonymousToken!: string;
}