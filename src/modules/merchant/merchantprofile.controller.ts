import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Put,
  Get,
  Query,
  Delete,
  UseFilters,
} from '@nestjs/common';
import { MerchantProfileService } from '@modules/merchant/merchantprofile.service';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { CreateMerchantDto } from '@dtos/CreateMerchant.dto';
import { ApproveRejectDto } from '@dtos/AppproverReject.dto';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { UpdateMerchantDto } from '@dtos/UpdateMerchant.dto';
import { ApiOperation, ApiUseTags } from '@nestjs/swagger';
import { AllException } from '@common/filters/httexception.filter';
import { ILike } from '@common/typeorm-custom/Ilike.typeorm';

@Controller('merchant')
export class MerchantProfileController {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient,
    private readonly merchantService: MerchantProfileService,
  ) {}

  @ApiOperation({ title: 'Get all merchant' })
  @ApiUseTags('Merchant')
  @UseFilters(AllException)
  @Get()
  getAllMerchant(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('order_by') order_by: string = 'id',
    @Query('search') search: string = '',
  ) {
    const offset = limit * (page - 1);
    let searchQuery: object | Array<object> = {
      is_obsolete: false,
    };

    if (search !== '') {
      searchQuery = [
        {
          is_obsolete: false,
          mobile_number: ILike(`${search}%`),
        },
        {
          is_obsolete: false,
          company_name: ILike(`${search}%`),
        },
      ];
    }

    return this.merchantService.GetAllMerchants(
      Number(page),
      offset,
      limit,
      {
        [order_by]: 'ASC',
      },
      searchQuery,
    );
  }
  @ApiOperation({ title: 'Get all temp merchant' })
  @ApiUseTags('Merchant')
  @UseFilters(AllException)
  @Get('pending')
  getAllTempMerchant(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status: string = 'PENDING',
    @Query('order_by') order_by: string = 'id',
    @Query('search') search: string = '',
  ) {
    const offset = limit * (page - 1);

    let searchQuery: object | Array<object> = {
      is_obsolete: false,
      status: 'PENDING',
    };

    if (search !== '') {
      searchQuery = [
        {
          is_obsolete: false,
          status: 'PENDING',
          mobile_number: ILike(`${search}%`),
        },
        {
          is_obsolete: false,
          status: 'PENDING',
          company_name: ILike(`${search}%`),
        },
      ];
    }

    return this.merchantService.GetAllTempMerchants(
      Number(page),
      offset,
      limit,
      searchQuery,
      { [order_by]: 'ASC' },
    );
  }

  @ApiOperation({ title: 'Get a merchant' })
  @ApiUseTags('Merchant')
  @UseFilters(AllException)
  @Get(':idx')
  getActiveMerchantByIdx(@Param('idx') idx: string) {
    return this.merchantService.GetMerchantsByCondition({
      idx,
      is_obsolete: false,
    });
  }

  @ApiOperation({ title: 'Get a pending merchant' })
  @ApiUseTags('Merchant')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @Get('pending/:idx')
  getPendingMerchantByIdx(@Param('idx') idx: string) {
    return this.merchantService.GetMerchantsTempByIdx(idx);
  }

  @ApiOperation({ title: 'Create Merchant' })
  @ApiUseTags('Merchant')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Post()
  async CreateMerchant(@Body() createMerchantDto: CreateMerchantDto) {
    const merchantExistsInActive = await this.merchantService.GetMerchantsByCondition(
      {
        mobile_number: createMerchantDto.mobile_number,
        is_obsolete: false,
      },
    );

    const merchantExistsInTemp = await this.merchantService.GetTempMerchantsByCondition(
      {
        mobile_number: createMerchantDto.mobile_number,
        is_obsolete: false,
      },
    );

    if (merchantExistsInActive || merchantExistsInTemp) {
      throw new HttpException(
        'Merchant with the mobile number exists',
        HttpStatus.CONFLICT,
      );
    }

    return this.merchantService.createMerchant(createMerchantDto);
  }

  @ApiOperation({ title: 'Verify Merchant' })
  @ApiUseTags('Merchant')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(new ValidationPipe({ validationError: { target: false } }))
  @Put('verify/:idx')
  async changeMerchantStatus(
    @Body() approveReject: ApproveRejectDto,
    @Param('idx') idx: string,
  ) {
    const merchant = await this.merchantService.GetMerchantsTempByIdx(idx);

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

    return this.merchantService.verifyMerchant(approveReject, idx);
  }

  @ApiOperation({ title: 'Update Merchant' })
  @ApiUseTags('Merchant')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(
    new ValidationPipe({ validationError: { target: false }, transform: true }),
  )
  @Put(':idx')
  async updateMerchant(
    @Body() updateMerchant: UpdateMerchantDto,
    @Param('idx') idx: string,
  ) {
    if (!isUUID(idx, 'all')) {
      throw new HttpException('Bad idx value', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const merchant = await this.merchantService.GetMerchantsByCondition({
      idx,
      is_obsolete: false,
    });

    if (!merchant) {
      throw new HttpException(
        'No merchant with the given idx',
        HttpStatus.NOT_FOUND,
      );
    }

    const merchantExistsInTemp = await this.merchantService.GetTempMerchantsByCondition(
      {
        mobile_number: updateMerchant.mobile_number,
        status: 'PENDING',
        is_obsolete: false,
      },
    );

    if (merchantExistsInTemp) {
      throw new HttpException(
        'Request for merchant already exists',
        HttpStatus.CONFLICT,
      );
    }

    return this.merchantService.updateMerchant(updateMerchant, idx);
  }

  @ApiOperation({ title: 'Delete Merchant' })
  @ApiUseTags('Merchant Group')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(new ValidationPipe({ validationError: { target: false } }))
  @Delete(':idx')
  async deleteMerchant(@Param('idx') idx: string) {
    const merchant = await this.merchantService.GetMerchantsByCondition({
      idx,
      is_obsolete: false,
    });

    if (!merchant) {
      throw new HttpException(
        'No merchant with the given idx',
        HttpStatus.NOT_FOUND,
      );
    }

    const merchantExistsInTemp = await this.merchantService.GetTempMerchantsByCondition(
      {
        mobile_number: merchant.mobile_number,
        status: 'PENDING',
        is_obsolete: false,
      },
    );

    if (merchantExistsInTemp) {
      throw new HttpException(
        'Request for merchant already exists',
        HttpStatus.CONFLICT,
      );
    }
    return this.merchantService.deleteMerchant(idx);
  }

  @ApiOperation({ title: 'Block Merchant' })
  @ApiUseTags('Merchant Group')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(AllException)
  @UsePipes(new ValidationPipe({ validationError: { target: false } }))
  @Delete('blockunblock/:idx')
  async blockUnblockMerchant(@Param('idx') idx: string) {
    const merchant = await this.merchantService.GetMerchantsByCondition({
      idx,
      is_obsolete: false,
    });

    if (!merchant) {
      throw new HttpException(
        'No merchant with the given idx',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.merchantService.deleteMerchant(idx);
  }
}
