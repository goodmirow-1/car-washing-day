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
import { CreateUserDto, FcmTokenDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { BasicMessageDto } from '../utils/basic-message.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import IUserRequest from '../utils/auth/user-request';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@Controller('v1/user')
@ApiTags('유저 API')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '유저 생성 API', description: '유저를 생성한다.' })
  @ApiResponse({ description: '유저를 생성한다.', type: User })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto>  {
    return this.userService.saveUser(createUserDto);
  }

  @Patch(':userId')
  @ApiOperation({ summary: '유저 수정 API', description: '유저의 정보를 수정한다. create에서 email을 제외하고 보낼 것' })
  @ApiResponse({ description: '유저를 수정한다.', type: BasicMessageDto })
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
    @Req() req: IUserRequest,
    ) : Promise<BasicMessageDto> {
    return this.userService.update(userId, dto , req.accessToken);
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인 API', description: '로그인 한다.' })
  @ApiResponse({ description: '로그인 한다.', type: UserLoginResponseDto })
  login(@Body() dto: UserLoginRequestDto): Promise<UserLoginResponseDto> {
    return this.userService.login(dto);
  }

  @Post('/updateFcmToken/:userId')
  @ApiOperation({ summary: 'fcm token update API', description: 'fcm token을 update 한다' })
  @ApiResponse({ description: 'fcm token을 update 한다', type: BasicMessageDto })
  updateFcmToken(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: FcmTokenDto,
    @Req() req: IUserRequest,
  ): Promise<BasicMessageDto> {
    return this.userService.updateFcmToken(userId, dto , req.accessToken);
  }

  @Delete(':userId')
  @ApiOperation({ summary: '회원 탈퇴 API', description: '탈퇴 한다.' })
  @ApiResponse({ description: '탈퇴 한다.', type: BasicMessageDto })
  delete(
      @Param('userId', ParseIntPipe) userId: number,
      @Req() req: IUserRequest,
    ): Promise<BasicMessageDto> {
    return this.userService.delete(userId, req.accessToken);
  }
}
