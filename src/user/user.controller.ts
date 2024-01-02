import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateFcmTokenDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { BasicMessageDto } from '../common/basic-message.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import IUserRequest from '../interfaces/user-request';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto>  {
    return this.userService.saveUser(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':userId')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
    @Req() req: IUserRequest,
    ) : Promise<BasicMessageDto> {
    return this.userService.update(userId, dto , req.accessToken);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('/login')
  login(@Body() dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    return this.userService.login(dto);
  }

  @Post('/updateFcmToken/:userId')
  updateFcmToken(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateFcmTokenDto,
    @Req() req: IUserRequest,
  ): Promise<BasicMessageDto> {
    return this.userService.updateFcmToken(userId, dto , req.accessToken);
  }

  @Post('/test/:userId')
  test(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<BasicMessageDto> {
    return this.userService.test(userId);
  }
}
