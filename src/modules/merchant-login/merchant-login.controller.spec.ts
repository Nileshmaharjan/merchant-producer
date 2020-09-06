import { Test, TestingModule } from '@nestjs/testing';
import { MerchantLoginController } from './merchant-login.controller';

describe('MerchantLogin Controller', () => {
  let controller: MerchantLoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantLoginController],
    }).compile();

    controller = module.get<MerchantLoginController>(MerchantLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
