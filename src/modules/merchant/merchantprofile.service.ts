import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MerchantProfile } from '@entities/MerchantProfile';
import { getManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMerchantDto } from '@dtos/CreateMerchant.dto';
import { ApproveRejectDto } from '@dtos/AppproverReject.dto';
import { MerchantProfileTemp } from '@entities/MerchantProfileTemp';
import { UpdateMerchantDto } from '@dtos/UpdateMerchant.dto';
import {
  cleanData,
  generateRandomUUID,
  removeEmpty,
} from '@utils/helperFunctions.utils';
import { classToPlain } from 'class-transformer';
import { MerchantGroup } from '@entities/MerchantGroup';

@Injectable()
export class MerchantProfileService {
  private readonly cacheHost: string;

  constructor(
    @InjectRepository(MerchantProfile)
    private readonly merchantRepo: Repository<MerchantProfile>,
    @InjectRepository(MerchantProfileTemp)
    private readonly merchantTempRepo: Repository<MerchantProfileTemp>,
    @InjectRepository(MerchantGroup)
    private readonly merchantGroupRepo: Repository<MerchantGroup>, // @Inject('kafka') private readonly kafka: ClientKafka, // private readonly httpService: HttpService,
  ) {}

  // async getHost() {
  //   if (this.cacheHost) {
  //     return this.cacheHost;
  //   }
  //   const host = await this.httpService.get('http://icanhazip.com').toPromise();
  //   return host.data;
  // }

  async GetAllMerchants(
    page: number,
    offset: number,
    limit: number,
    orderBy: {},
    search: Array<object> | object,
  ) {
    const [result, total] = await this.merchantRepo.findAndCount({
      where: search,
      take: limit,
      skip: offset,
      relations: ['merchant_group'],
      order: orderBy,
    });
    //
    // for (let i = 0; i < total; i++) {
    //   if (result[i].merchant_group_id === undefined) {
    //     delete result[i].merchant_group_id.id;
    //     delete result[i].merchant_group_id.password;
    //     delete result[i].merchant_group_id.username;
    //   }
    // }

    const pages = Math.ceil(total / limit);
    // const host = await this.getHost();
    return {
      total_pages: pages,
      total_items: total,
      // next: hasNext(page, pages, host),
      // previous: hasPrevious(page, pages, host),
      current_page: page,
      items: classToPlain(result),
    };
  }

  async GetAllTempMerchants(
    page: number,
    offset: number,
    limit: number,
    search: object | Array<object>,
    orderBY: {},
  ) {
    const [result, total] = await this.merchantTempRepo.findAndCount({
      take: limit,
      skip: offset,
      where: search,
      relations: ['merchant_group'],
      order: orderBY,
    });

    // for (let i = 0; i < total; i++) {
    //   if (result[i].merchant_group_id === undefined) {
    //     delete result[i].merchant_group_id.id;
    //     delete result[i].merchant_group_id.password;
    //     delete result[i].merchant_group_id.username;
    //   }
    // }

    const pages = Math.ceil(total / limit);
    // const host = await this.getHost();
    return {
      total_pages: pages,
      total_items: total,
      // next: hasNext(page, pages, host),
      // previous: hasPrevious(page, pages, host),
      current_page: page,
      items: classToPlain(result),
    };
  }

  async GetTempMerchantsByCondition(condition: {}): Promise<
    MerchantProfileTemp
  > {
    return this.merchantTempRepo.findOne(condition);
  }

  async GetMerchantsByCondition(condition: {}): Promise<MerchantProfile> {
    return await this.merchantRepo.findOne({
      where: condition,
      relations: ['merchant_group'],
    });
  }

  async GetMerchantsTempByIdx(idx: string): Promise<MerchantProfileTemp> {
    return await this.merchantTempRepo.findOne({
      where: { idx, is_obsolete: false },
      relations: ['merchant_group', 'merchant_id'],
    });
  }

  async updateMerchant(merchantData: UpdateMerchantDto, idx: string) {
    const { id }: any = await this.merchantRepo.findOne({
      idx,
    });

    if (merchantData.merchant_group !== null) {
      const groupId = await this.merchantGroupRepo.findOne({
        idx: merchantData.merchant_group,
      });
      merchantData.merchant_group = groupId.id;
    }

    cleanData(merchantData, [
      'id',
      'idx',
      'is_obsolete',
      'is_active',
      'created_on',
      'modified_on',
    ]);

    merchantData.status = 'PENDING';
    merchantData.created_by = process.env.idx;
    merchantData.merchant_id = id.toString();
    // @ts-ignore
    await this.merchantTempRepo.save({ ...merchantData, operation: 'UPDATE' });

    return { statusCode: 200, message: 'Merchant Update Pending' };
  }

  async createMerchant(createMerchantDto: CreateMerchantDto) {
    cleanData(createMerchantDto, [
      'id',
      'idx',
      'is_obsolete',
      'is_active',
      'created_on',
      'modified_on',
    ]);

    await getManager().transaction(async transactionalEntityManager => {
      createMerchantDto.operation = 'CREATE';
      createMerchantDto.created_by = await generateRandomUUID();
      createMerchantDto.status = 'PENDING';
      createMerchantDto.created_by = process.env.idx;

      if (createMerchantDto.merchant_group !== null) {
        const AuthRes: any = await transactionalEntityManager
          .createQueryBuilder(MerchantGroup, 'merchantGroup')
          .where('idx = :idx', { idx: createMerchantDto.merchant_group })
          .getOne();

        if (!AuthRes) {
          throw new HttpException(
            'Merchant group doesnt exist',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        createMerchantDto.merchant_group = AuthRes.id;
      }

      await transactionalEntityManager
        .getRepository(MerchantProfileTemp)
        .insert(createMerchantDto);
    });

    return { statusCode: 200, message: 'Merchant Add pending' };
  }

  async deleteMerchant(idx: string) {
    const merchant: any = await this.merchantRepo.findOne({
      idx,
    });
    await this.merchantTempRepo.save({
      company_name: merchant.company_name,
      mobile_number: merchant.mobile_number,
      merchant_code: merchant.merchant_code,
      nationality: merchant.nationality,
      phone_number: merchant.phone_number,
      bank_account_no: merchant.bank_account_no,
      bank_address: merchant.bank_address,
      bank_swift_code: merchant.bank_swift_code,
      bank_code: merchant.bank_code,
      tax_code: merchant.tax_code,
      establishment_licence_no: merchant.establishment_licence_no,
      merchant_nature: merchant.merchant_nature,
      status: 'PENDING',
      operation: 'DELETE',
      merchant_id: merchant.id,
      created_by: process.env.idx,
    });
    return { statusCode: 200, message: 'Delete pending' };
  }

  async verifyMerchant(merchantData: ApproveRejectDto, idxVal: string) {
    if (merchantData.status === 'REJECTED') {
      return await this.merchantTempRepo.update(
        { idx: idxVal },
        { status: 'REJECTED' },
      );
    }
    const { operation, ...tempData }: any = await this.merchantTempRepo.findOne(
      {
        where: { idx: idxVal },
        relations: ['merchant_id', 'merchant_group'],
      },
    );

    if (operation === 'CREATE') {
      const {
        id,
        idx,
        is_obsolete,
        is_active,
        created_on,
        modified_on,
        ...merchant
      } = tempData;

      await getManager().transaction(async transactionalEntityManager => {
        // const createdBy = await generateRandomUUID();

        const saveToActive = await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(MerchantProfile)
          .values([merchant])
          .execute();
        const id: any = saveToActive.identifiers[0].id;

        await transactionalEntityManager
          .getRepository(MerchantProfileTemp)
          .update({ idx: idxVal }, { merchant_id: id, status: 'APPROVED' });
        Logger.log(id);
      });
      return { statusCode: 200, message: 'Verified Create Operation' };
    }

    if (operation === 'UPDATE') {
      const merchantResponse = await this.merchantTempRepo.findOne({
        where: { idx: idxVal },
        relations: ['merchant_id', 'merchant_group'],
      });

      // filtering out data not in MerchantProfile

      const {
        id,
        idx,
        operation,
        merchant_id,
        status,
        is_obsolete,
        is_active,
        created_on,
        modified_on,
        ...data
      }: any = merchantResponse;

      await getManager().transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .getRepository(MerchantProfileTemp)
          .update({ idx: idxVal }, { status: 'APPROVED' });

        await transactionalEntityManager
          .getRepository(MerchantProfile)
          .update({ id: merchant_id.id }, removeEmpty(data));
      });

      return { statusCode: 200, message: 'Verified Update Operation' };
    }

    if (operation === 'DELETE') {
      await getManager().transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .getRepository(MerchantProfileTemp)
          .update({ idx: idxVal }, { status: 'APPROVED' });

        await transactionalEntityManager
          .getRepository(MerchantProfile)
          .update({ id: tempData.merchant_id.id }, { is_obsolete: true });
      });

      return { statusCode: 200, message: 'Verified Delete Operation' };
    }
  }
}
