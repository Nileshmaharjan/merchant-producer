import { Test, TestingModule } from '@nestjs/testing';
import { MerchantService } from './merchantprofile.service';

describe('MerchantService', () => {
  let service: MerchantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MerchantService],
    }).compile();

    service = module.get<MerchantService>(MerchantService);
  });

  xit('should be defined', () => {
    expect(service).toBeDefined();
  });
});
