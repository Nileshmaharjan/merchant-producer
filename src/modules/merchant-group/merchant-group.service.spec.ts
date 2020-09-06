import { Test, TestingModule } from '@nestjs/testing';
import { MerchantGroupService } from './merchant-group.service';

describe('MerchantGroupService', () => {
  let service: MerchantGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MerchantGroupService],
    }).compile();

    service = module.get<MerchantGroupService>(MerchantGroupService);
  });

  xit('should be defined', () => {
    expect(service).toBeDefined();
  });
});
