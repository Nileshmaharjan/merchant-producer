import { Test, TestingModule } from '@nestjs/testing';
import { MerchantGroupController } from './merchant-group.controller';
import { MerchantGroupService } from './merchant-group.service';
import { MerchantGroup } from '../../entities/MerchantGroup';
import { CreateMerchantGroup } from '../../dtos/CreateMerchantGroup.dto';
import { UpdateMerchantGroup } from '../../dtos/UpdateMerchantGroup.dto';

describe('MerchantGroup Controller', () => {
  let merchantGroupcontroller: MerchantGroupController;
  let merchantGroupService: MerchantGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantGroupController],
      providers: [
        {
          provide: MerchantGroupService,
          useValue: {
            getAllMerchantGroups: jest.fn().mockResolvedValue([
              {
                id: 3,
                idx: 'd692a32e-046b-11ea-8bbf-0242ac110003',
                username: 'AEON',
                password: 'jlKjfoi980@3/!',
                group_name: 'test',
                logo_image: 'abc.png',
                created_on: '2019-11-11T04:27:59.307Z',
                is_obsolete: false,
                modified_on: '2019-11-11T04:27:59.307Z',
              },
            ]),
            getMerchantGroupByIdx: jest.fn().mockImplementation((idx: string) =>
              Promise.resolve({
                id: 3,
                idx: 'd692a32e-046b-11ea-8bbf-0242ac110003',
                username: 'AEON',
                password: 'jlKjfoi980@3/!',
                group_name: 'test',
                logo_image: 'abc.png',
                created_on: '2019-11-11T04:27:59.307Z',
                is_obsolete: false,
                modified_on: '2019-11-11T04:27:59.307Z',
              }),
            ),
            createMerchantGroup: jest
              .fn()
              .mockImplementation((createMerchantGroup: CreateMerchantGroup) =>
                Promise.resolve({ idx: 'a uuid', ...createMerchantGroup }),
              ),
            updateMerchantGroup: jest
              .fn()
              .mockImplementation((updateMerchantGroup: UpdateMerchantGroup) =>
                Promise.resolve({ idx: 'a uuid', ...updateMerchantGroup }),
              ),
            deleteMerchantGroup: jest.fn().mockResolvedValue({ deleted: true }),
          },
        },
      ],
    }).compile();

    merchantGroupcontroller = module.get<MerchantGroupController>(
      MerchantGroupController,
    );
    merchantGroupService = module.get<MerchantGroupService>(
      MerchantGroupService,
    );
  });

  describe('merchant-grpup', () => {
    it('should return an array of merchant groups', () => {
      expect(merchantGroupcontroller.getAllMerchantGroups()).resolves.toEqual(
        Array<MerchantGroup>(),
      );
    });

    it('should return a single permission role', () => {
      expect(
        merchantGroupcontroller.getMerchantGroupByIdx(
          '0382d214-011f-11ea-bc49-0242ac110003',
        ),
      ).resolves.toEqual({
        id: 3,
        idx: 'd692a32e-046b-11ea-8bbf-0242ac110003',
        username: 'AEON',
        password: 'jlKjfoi980@3/!',
        group_name: 'test',
        logo_image: 'abc.png',
        created_on: '2019-11-11T04:27:59.307Z',
        is_obsolete: false,
        modified_on: '2019-11-11T04:27:59.307Z',
      });
    });

    it('should create a new Merchant Group', () => {
      const newMerchantGroup: CreateMerchantGroup = {
        id: 3,
        idx: 'd692a32e-046b-11ea-8bbf-0242ac110003',
        username: 'AEON',
        password: 'jlKjfoi980@3/!',
        group_name: 'test',
        logo_image: 'abc.png',
        created_on: '2019-11-11T04:27:59.307Z',
        is_obsolete: false,
        modified_on: '2019-11-11T04:27:59.307Z',
      };
      expect(
        merchantGroupcontroller.createMerchantGroup(newMerchantGroup),
      ).resolves.toEqual({
        idx: 'a uuid',
        ...newMerchantGroup,
      });
    });

    it('should update a merchant group', () => {
      const updatedMerchantGroup: UpdateMerchantGroup = {
        id: 3,
        idx: 'd692a32e-046b-11ea-8bbf-0242ac110003',
        username: 'AEON',
        password: 'jlKjfoi980@3/!',
        group_name: 'test',
        logo_image: 'abc.png',
        created_on: '2019-11-11T04:27:59.307Z',
        is_obsolete: false,
        modified_on: '2019-11-11T04:27:59.307Z',
      };
      expect(
        merchantGroupcontroller.updateMerchantGroup(updatedMerchantGroup),
      ).resolves.toEqual({
        idx: 'a uuid',
        ...updatedMerchantGroup,
      });
    });

    it('should delete a merchant group', () => {
      expect(
        merchantGroupcontroller.deleteMerchantGroup(
          'bc972992-00ae-11ea-b64f-0242ac110003',
        ),
      ).resolves.toEqual({
        deleted: true,
      });
    });
  });
});
