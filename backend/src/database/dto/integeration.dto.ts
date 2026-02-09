import { IsEnum, IsNotEmpty } from "class-validator";
import { IntegerationAppTypeEnum } from "../entities/integration.entity.js";

export class AppTypeDto {
  @IsEnum(IntegerationAppTypeEnum)
  @IsNotEmpty()
  appType: IntegerationAppTypeEnum;
}
