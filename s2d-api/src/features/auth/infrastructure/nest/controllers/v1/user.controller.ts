import { AuthUser } from "@features/auth/entities/auth-user";
import { User } from "@features/auth/entities/user";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { myUserServiceFactory } from "@features/auth/factories/user-service-factory";
import { IAppUserUseCase } from "@features/auth/ports/app-user.use-case.definition";
import { IUserServiceUseCase } from "@features/auth/ports/user-service.use-case.definition";
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { GetAuthUser, GetUser } from "../../custom-decorators";
import { AuthUserGuard, UserGuard } from "../../guards/users.guard";
import {
  CreateUserDTO,
  UpdateHealthDTO,
  UpdateAppUserDTO,
} from "./controller-dtos/user.dto";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AppUser } from "@features/auth/entities/app-user";
import { CommonErrorResponse } from "@common/nest/api-error.dto";

@ApiTags("users")
@Controller({
  path: "users",
  version: "1",
})
export class UserControllerV1 {
  private readonly userServiceUseCase: IUserServiceUseCase;
  private readonly appUserUseCase: IAppUserUseCase;
  constructor() {
    const { userServiceUseCase } = myUserServiceFactory();
    const { appUserUseCase } = myAppUserFactory();
    this.userServiceUseCase = userServiceUseCase;
    this.appUserUseCase = appUserUseCase;
  }

  @Post()
  @ApiResponse({ type: User, status: 201 })
  @ApiResponse({
    type: CommonErrorResponse,
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    type: CommonErrorResponse,
    status: HttpStatus.CONFLICT,
    description: "the user with the given email already exists",
  })
  create(@Body() data: CreateUserDTO) {
    return this.userServiceUseCase.create({
      appUserData: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      authUserData: {
        email: data.email,
        password: data.password,
      },
    });
  }

  @UseGuards(UserGuard)
  @Get("/me")
  @ApiBearerAuth()
  @ApiResponse({ type: User, status: 200 })
  @ApiResponse({ type: CommonErrorResponse, status: 401 })
  getMe(@GetUser() user: User) {
    return user;
  }

  @UseGuards(UserGuard)
  @Patch("/me")
  @ApiBearerAuth()
  @ApiResponse({ type: AppUser, status: 200 })
  @ApiResponse({ type: CommonErrorResponse, status: 400 })
  @ApiResponse({ type: CommonErrorResponse, status: 401 })
  updateMe(@GetUser() user: User, @Body() data: UpdateAppUserDTO) {
    return this.appUserUseCase.update({
      searchBy: { id: user.appUser.id },
      data: data,
    });
  }

  @UseGuards(UserGuard)
  @Patch("/me/health-data")
  @ApiBearerAuth()
  @ApiResponse({ type: AppUser, status: 200 })
  @ApiResponse({ type: CommonErrorResponse, status: 400 })
  @ApiResponse({ type: CommonErrorResponse, status: 401 })
  updateHealthData(@GetUser() user: User, @Body() data: UpdateHealthDTO) {
    return this.appUserUseCase.updateHealthData({
      searchBy: { id: user.appUser.id },
      data: data,
    });
  }

  @UseGuards(AuthUserGuard)
  @Delete("/me")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiResponse({ status: 204 })
  @ApiResponse({ type: CommonErrorResponse, status: 401 })
  async deleteMe(@GetAuthUser() user: AuthUser) {
    await this.userServiceUseCase.delete({
      searchBy: { id: user.id },
    });
    return { sucess: true };
  }
}
