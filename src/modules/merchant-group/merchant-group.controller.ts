import {
  Controller,
  Get,
  Query,
  Inject,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { MerchantGroupService } from './merchant-group.service';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { CreateMerchantGroupDto } from '@dtos/CreateMerchantGroup.dto';
import { ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { ApproveRejectDto } from '@dtos/AppproverReject.dto';
import { UpdateMerchantGroupDto } from '@dtos/UpdateMerchantGroup.dto';
import { AllException } from '@common/filters/httexception.filter';
import { Not } from 'typeorm';
import { ILike } from '@common/typeorm-custom/Ilike.typeorm';

@Controller('merchant-group')
export class MerchantGroupController {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient,
    private readonly merchantGroupService: MerchantGroupService,
  ) {}

  @ApiOperation({ title: 'Get all active merchant group' })
  @ApiUseTags('Merchant group')
  @Get()
  getAllMerchantGroup(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    let searchQuery: ISearchGroupInterface = { is_obsolete: false };

    if (search !== '') {
      searchQuery.group_name = ILike(`${search}%`);
    }
    const offset = limit * (page - 1);
    return this.merchantGroupService.GetAllMerchantGroup(
      Number(page),
      offset,
      limit,
      searchQuery,
    );
  }

  @ApiOperation({ title: 'Get pending merchant group list' })
  @ApiUseTags('Merchant group')
  @Get('pending')
  getAllPendingMerchantGroup(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    let searchQuery: ISearchTempGroupInterface = {
      is_obsolete: false,
      status: 'PENDING',
    };
    if (search !== '') {
      searchQuery.group_name = ILike(`${search}%`);
    }
    const offset = limit * (page - 1);
    return this.merchantGroupService.GetAllPendingMerchantGroup(
      Number(page),
      offset,
      limit,
      searchQuery,
    );
  }

  @ApiOperation({ title: 'Get a active merchant group' })
  @ApiUseTags('Merchant Group')
  @Get(':idx')
  getMerchantGroupByIdx(@Param('idx') idx: string) {
    return this.merchantGroupService.GetMerchantGroupByIdx(idx);
  }

  @ApiOperation({ title: 'Get a pending merchant group' })
  @ApiUseTags('Merchant Group')
  @Get('pending/:idx')
  getPendingMerchantGroupByIdx(@Param('idx') idx: string) {
    return this.merchantGroupService.GetPendingMerchantGroupByIdx(idx);
  }

  @ApiOperation({ title: 'Create Merchant Group' })
  @ApiUseTags('Merchant Group')
  @UseFilters(AllException)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ validationError: { target: false } }))
  @Post()
  async CreateMerchantGroup(
    @Body() createMerchantGroupDto: CreateMerchantGroupDto,
  ) {
    let [existsInActiveGroup, existsInTempGroup] = await Promise.all([
      await this.merchantGroupService.getActiveMerchantGroup({
        group_name: createMerchantGroupDto.group_name,
        is_obsolete: false,
      }),
      await this.merchantGroupService.getTempMerchantGroup({
        group_name: createMerchantGroupDto.group_name,
        status: 'PENDING',
      }),
    ]);

    if (!!existsInActiveGroup || !!existsInTempGroup) {
      throw new HttpException(
        'Merchant group with name exists',
        HttpStatus.CONFLICT,
      );
    }

    return this.merchantGroupService.addMerchantGroupTemp(
      createMerchantGroupDto,
    );
  }

  @ApiOperation({ title: 'Verify Merchant Group' })
  @ApiUseTags('Merchant Group')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(new ValidationPipe({ validationError: { target: false } }))
  @Put('verify/:idx')
  async changeMerchantGroupStatus(
    @Body() approveReject: ApproveRejectDto,
    @Param('idx') idx: string,
  ) {
    if (!isUUID(idx, 'all')) {
      throw new HttpException('Bad idx value', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const merchant = await this.merchantGroupService.GetPendingMerchantGroupByIdx(
      idx,
    );

    if (!merchant) {
      throw new HttpException(
        'No merchant verification with the given idx',
        HttpStatus.NOT_FOUND,
      );
    }

    if (merchant.created_by === process.env.idx) {
      throw new HttpException(
        'Cannot verify own request',
        HttpStatus.BAD_REQUEST,
      );
    }

    // change verify merchant to changeMerchantGroupStatus
    return this.merchantGroupService.verifyMerchantGroup(approveReject, idx);
  }

  @ApiOperation({ title: 'Update Merchant Group' })
  @ApiUseTags('Merchant Group')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(new ValidationPipe({ validationError: { target: false } }))
  @Put(':idx')
  async updateMerchantGroup(
    @Body() updateMerchantGroup: UpdateMerchantGroupDto,
    @Param('idx') idx: string,
  ) {
    if (!isUUID(idx, 'all')) {
      throw new HttpException('Bad idx value', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const merchantGroup = await this.merchantGroupService.GetMerchantGroupByIdx(
      idx,
    );

    if (!merchantGroup) {
      throw new HttpException(
        'No merchant group with the given idx',
        HttpStatus.NOT_FOUND,
      );
    }

    const merchantGroupExistsInTemp = await this.merchantGroupService.getTempMerchantGroup(
      {
        merchant_group: merchantGroup.id,
        status: 'PENDING',
        is_obsolete: false,
      },
    );

    if (merchantGroupExistsInTemp) {
      throw new HttpException(
        'Request for merchant group already exists',
        HttpStatus.CONFLICT,
      );
    }

    const groupNameExists = await this.merchantGroupService.getActiveMerchantGroup(
      {
        group_name: updateMerchantGroup.group_name,
        idx: Not(idx),
      },
    );
    if (groupNameExists) {
      throw new HttpException(
        'Group name already exists',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.merchantGroupService.updateMerchantGroupTemp(
      updateMerchantGroup,
      idx,
    );
  }

  @ApiOperation({ title: 'Delete Merchant Group' })
  @ApiUseTags('Merchant Group')
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ validationError: { target: false } }))
  @Delete(':idx')
  async deleteMerchantGroup(@Param('idx') idx: string) {
    if (!isUUID(idx, 'all')) {
      throw new HttpException('Bad idx value', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const merchantGroup = await this.merchantGroupService.GetMerchantGroupByIdx(
      idx,
    );

    if (!merchantGroup) {
      throw new HttpException(
        'No Merchant Group with the given idx',
        HttpStatus.NOT_FOUND,
      );
    }

    const merchantGroupExistsInTemp = await this.merchantGroupService.getTempMerchantGroup(
      {
        merchant_group: merchantGroup.id,
        status: 'PENDING',
        is_obsolete: false,
      },
    );

    if (merchantGroupExistsInTemp) {
      throw new HttpException(
        'Request for merchant group already exists',
        HttpStatus.CONFLICT,
      );
    }

    if (
      merchantGroup.merchantProfiles.some(mProfile => !mProfile.is_obsolete)
    ) {
      throw new HttpException(
        'Merchant group is being used',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.merchantGroupService.deleteMerchantGroupTemp(
      merchantGroup,
      idx,
    );
  }
}
