import { Test, TestingModule } from '@nestjs/testing';
import { WashingcardayService } from './washingcarday.service';

describe('WashingcardayService', () => {
  let service: WashingcardayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WashingcardayService],
    }).compile();

    service = module.get<WashingcardayService>(WashingcardayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
