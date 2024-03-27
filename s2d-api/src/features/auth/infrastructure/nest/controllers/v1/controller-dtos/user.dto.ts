export class CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class UpdateAppUserDTO {
  firstName?: string;
  lastName?: string;
}

export enum GenderEnumDTO {
  Male = "male",
  Female = "female",
}

export class UpdateHealthDTO {
  age?: number;
  gender?: GenderEnumDTO;
  height?: number;
  weight?: number;
}
