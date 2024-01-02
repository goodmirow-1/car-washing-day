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
import IUserRequest from '../interfaces/user-request';

@Controller('washingcarday')
export class WashingcardayController {
  constructor(private readonly washingcardayService: WashingcardayService) {}

  @Post(':userId')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createWashingcardayDto: CreateWashingcardayDto,
    @Req() req: IUserRequest) {
    return this.washingcardayService.create(userId, createWashingcardayDto, req.accessToken);
  }

  @Get()
  findAll() {
    return this.washingcardayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.washingcardayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWashingcardayDto: UpdateWashingcardayDto) {
    return this.washingcardayService.update(+id, updateWashingcardayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.washingcardayService.remove(+id);
  }
}
