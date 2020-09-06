import { HttpService, Inject, Injectable, Logger } from '@nestjs/common';
import { MerchantGroup } from '@entities/MerchantGroup';
import { CreateMerchantGroupDto } from '@dtos/CreateMerchantGroup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { UpdateMerchantGroupDto } from '@dtos/UpdateMerchantGroup.dto';
import { ApproveRejectDto } from '@dtos/AppproverReject.dto';
import { MerchantGroupTemp } from '@entities/MerchantGroupTemp';
import {
  cleanData,
  generateRandomUUID,
  hasNext,
  hasPrevious,
} from '@utils/helperFunctions.utils';
import { classToPlain } from 'class-transformer';

@Injectable()
export class MerchantGroupService {
  private readonly cacheHost: string;
  private readonly logger: Logger = new Logger('MerchantGroupService');
  constructor(
    @InjectRepository(MerchantGroup)
    private readonly merchantGroupRepo: Repository<MerchantGroup>,
    @InjectRepository(MerchantGroupTemp)
    private readonly merchantGroupTempRepo: Repository<MerchantGroupTemp>,
    @Inject('kafka') private readonly kafka: ClientKafka,
    private readonly httpService: HttpService,
  ) {}

  async getHost() {
    if (this.cacheHost) {
      return this.cacheHost;
    }
    const host = await this.httpService.get('http://icanhazip.com').toPromise();
    return host.data;
  }

  async GetAllMerchantGroup(
    page: number,
    offset: number,
    limit: number,
    search: ISearchGroupInterface,
  ) {
    const [result, total] = await this.merchantGroupRepo.findAndCount({
      where: search,
      take: limit,
      skip: offset,
    });
    // for (let i = 0; i < total; i++) {
    //   delete result[i].id;
    // }
    const pages = Math.ceil(total / limit);
    const host = await this.getHost();
    return {
      total_pages: pages,
      total_items: total,
      next: hasNext(page, pages, host),
      previous: hasPrevious(page, pages, host),
      current_page: page,
      items: classToPlain(result),
    };
  }

  async GetAllPendingMerchantGroup(
    page: number,
    offset: number,
    limit: number,
    search: ISearchTempGroupInterface,
  ) {
    const [result, total] = await this.merchantGroupTempRepo.findAndCount({
      where: search,
      take: limit,
      skip: offset,
    });
    const pages = Math.ceil(total / limit);
    const host = await this.getHost();

    return {
      total_pages: pages,
      total_items: total,
      next: hasNext(page, pages, host),
      previous: hasPrevious(page, pages, host),
      current_page: page,
      items: classToPlain(result),
    };
  }

  async GetMerchantGroupByIdx(idx: string): Promise<MerchantGroup> {
    return await this.merchantGroupRepo.findOne({
      where: { idx, is_obsolete: false },
      relations: ['merchantProfiles'],
    });
  }

  async GetPendingMerchantGroupByIdx(idx: string): Promise<MerchantGroupTemp> {
    return await this.merchantGroupTempRepo.findOne({
      where: { idx, is_obsolete: false, status: 'PENDING' },
    });
  }

  async GetTempMerchantsGroupByCondition(condition: {}): Promise<
    MerchantGroupTemp
  > {
    return this.merchantGroupTempRepo.findOne(condition);
  }

  async getTempMerchantGroup(condition: {}): Promise<MerchantGroupTemp> {
    return this.merchantGroupTempRepo.findOne(condition);
  }

  async getActiveMerchantGroup(condition: {}): Promise<MerchantGroup> {
    return this.merchantGroupRepo.findOne(condition);
  }

  async addMerchantGroupTemp(merchantData: CreateMerchantGroupDto) {
    cleanData(merchantData, [
      'id',
      'idx',
      'is_obsolete',
      'is_active',
      'created_on',
      'modified_on',
    ]);
    merchantData.operation = 'CREATE';
    merchantData.created_by = process.env.idx;
    merchantData.status = 'PENDING';
    await this.merchantGroupTempRepo.save(merchantData);
    return { statusCode: 200, message: 'Merchant Group Added' };
  }

  async verifyMerchantGroup(merchantData: ApproveRejectDto, Id: any) {
    if (merchantData.status === 'REJECTED') {
      return await this.merchantGroupTempRepo.update(
        { idx: Id },
        { status: 'REJECTED' },
      );
    }
    const { operation } = await this.merchantGroupTempRepo.findOne({
      idx: Id,
    });

    if (operation === 'CREATE') {
      const { idx, ...merchant } = await this.merchantGroupTempRepo.findOne({
        idx: Id,
      });
      await getManager().transaction(async transactionalEntityManager => {
        const saveToActive = await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(MerchantGroup)
          .values([merchant])
          .execute();
        const id = saveToActive.identifiers[0].id;

        await transactionalEntityManager
          .createQueryBuilder()
          .update(MerchantGroupTemp)
          .set({ merchant_group: id, status: 'APPROVED' })
          .set({ status: 'APPROVED' })
          .where('idx = :idx', { idx: Id })
          .execute();
      });
      return { statusCode: 200, message: 'Verified Create Operation' };
    }

    if (operation === 'UPDATE') {
      const merchantGroup = await this.merchantGroupTempRepo.findOne({
        where: { idx: Id },
        relations: ['merchant_group'],
      });

      console.log(merchantGroup);
      const { id, idx, merchant_group, status, ...data }: any = merchantGroup;

      await getManager().transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .getRepository(MerchantGroupTemp)
          .update({ idx: Id }, { status: 'APPROVED' });
        await transactionalEntityManager
          .createQueryBuilder()
          .update(MerchantGroup)
          .where('id = :id', { id: merchantGroup.merchant_group.id })
          .set({
            username: merchantGroup.username,
            password: merchantGroup.password,
            group_name: merchantGroup.group_name,
          })
          .execute();
      });
      return { statusCode: 200, message: 'Verified Update Operation' };
    }

    if (operation === 'DELETE') {
      const merchantGroup = await this.merchantGroupTempRepo.findOne({
        where: { idx: Id },
        relations: ['merchant_group'],
      });

      const { id, idx, merchant_group, status, ...data }: any = merchantGroup;

      await getManager().transaction(async transactionalEntityManager => {
        await transactionalEntityManager
          .getRepository(MerchantGroupTemp)
          .update({ idx: Id }, { status: 'APPROVED' });
        await transactionalEntityManager
          .createQueryBuilder()
          .update(MerchantGroup)
          .where('id = :id', { id: merchantGroup.merchant_group.id })
          .set({
            is_obsolete: true,
            is_active: false,
          })
          .execute();
      });
      return { statusCode: 200, message: 'Verified Delete Operation' };
    }
  }

  async updateMerchantGroupTemp(
    merchantData: UpdateMerchantGroupDto,
    Id: string,
  ) {
    const { id } = await this.merchantGroupRepo.findOne({
      idx: Id,
    });
    cleanData(merchantData, [
      'id',
      'idx',
      'is_obsolete',
      'is_active',
      'created_on',
      'modified_on',
    ]);

    merchantData.operation = 'UPDATE';
    merchantData.status = 'PENDING';
    merchantData.merchant_group = id;
    merchantData.created_by = process.env.idx;
    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager
        .getRepository(MerchantGroupTemp)
        .save(merchantData);
    });
    return 'Update Merchant Group pending';
  }

  async deleteMerchantGroupTemp(merchantData: any, Id: string) {
    const { id, group_name } = await this.merchantGroupRepo.findOne({
      idx: Id,
    });

    merchantData.merchant_group = id.toString();

    await getManager().transaction(async transactionalEntityManager => {
      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(MerchantGroupTemp)
        .values([
          {
            operation: 'DELETE',
            merchant_group: merchantData.merchant_group,
            group_name: merchantData.group_name,
            created_by: process.env.idx,
            status: 'PENDING',
          },
        ])
        .execute();
    });
    return { statusCode: 200, message: 'Delete Merchant Group' };
  }
}
