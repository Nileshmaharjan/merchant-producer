import { Test, TestingModule } from '@nestjs/testing';
import { MerchantLoginService } from './merchant-login.service';

describe('MerchantLoginService', () => {
  let service: MerchantLoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MerchantLoginService],
    }).compile();

    service = module.get<MerchantLoginService>(MerchantLoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
