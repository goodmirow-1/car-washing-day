import { Test, TestingModule } from '@nestjs/testing';
import { WashingcardayController } from './washingcarday.controller';
import { WashingcardayService } from './washingcarday.service';

describe('WashingcardayController', () => {
  let controller: WashingcardayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WashingcardayController],
      providers: [WashingcardayService],
    }).compile();

    controller = module.get<WashingcardayController>(WashingcardayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
