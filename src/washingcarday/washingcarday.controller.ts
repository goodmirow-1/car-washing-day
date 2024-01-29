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
import { WashingcardayService } from './washingcarday.service';
import { CreateWashingcardayDto } from './dto/create-washingcarday.dto';
import { UpdateWashingcardayDto } from './dto/update-washingcarday.dto';
import { WashingcardayInfoResponseDto } from './dto/washingcarday-info.dto';
import { BasicMessageDto } from '../common/basic-message.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Washingcarday } from './entities/washingcarday.entity';
import IUserRequest from '../interfaces/user-request';

@Controller('v1/washingcarday')
@ApiTags('세차일 API')
export class WashingcardayController {
  constructor(private readonly washingcardayService: WashingcardayService) {}

  @Post(':userId')
  @ApiOperation({ summary: '세차일 생성 API', description: '세차일을 생성한다.' })
  @ApiResponse({ description: '세차일을 생성한다.', type: WashingcardayInfoResponseDto })
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createWashingcardayDto: CreateWashingcardayDto,
    @Req() req: IUserRequest) {
    return this.washingcardayService.create(userId, createWashingcardayDto, req.accessToken);
  }

  @Delete(':userId/:warshingdayId')
  @ApiOperation({ summary: '세차일 삭제 API', description: '탈퇴 한다.' })
  @ApiResponse({ description: '등록한 세차일을 삭제 한다.', type: BasicMessageDto })
  delete(
      @Param('userId', ParseIntPipe) userId: number,
      @Param('warshingdayId', ParseIntPipe) warshingdayId: number,
      @Req() req: IUserRequest,
    ): Promise<BasicMessageDto> {
    return this.washingcardayService.delete(userId, warshingdayId, req.accessToken);
  }

  @Get('/test')
  @ApiOperation({ summary: '세차일 fcm test', description: 'fcm test용.' })
  @ApiResponse({ description: 'fcm token send message test용.', type: BasicMessageDto })
  get(
    ): Promise<BasicMessageDto> {
    return this.washingcardayService.test();
  }
}
