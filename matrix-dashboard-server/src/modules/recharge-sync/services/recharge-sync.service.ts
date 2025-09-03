import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserRechargeFeature } from '../entities/user-recharge-feature.entity';
import { ExternalApiService } from './external-api.service';
import { 
  SyncRechargeFeatureDto, 
  BatchSyncRechargeFeatureDto,
  RechargeFeatureQueryDto,
  UserRechargeFeatureItem 
} from '../dto/recharge-sync.dto';

@Injectable()
export class RechargeSyncService {
  private readonly logger = new Logger(RechargeSyncService.name);

  constructor(
    @InjectRepository(UserRechargeFeature)
    private userRechargeFeatureRepository: Repository<UserRechargeFeature>,
    private externalApiService: ExternalApiService,
  ) {}

  /**
   * 同步用户充值功能数据
   * @param syncDto 同步参数
   * @returns 同步结果
   */
  async syncUserRechargeFeature(syncDto: SyncRechargeFeatureDto) {
    const { userIds } = syncDto;
    
    try {
      this.logger.log(`开始同步用户充值功能数据: ${userIds}`);

      // 调用外部API获取数据
      const externalData = await this.externalApiService.getUserRechargeFeature(userIds);
      
      if (!externalData.items || externalData.items.length === 0) {
        this.logger.warn('外部API返回数据为空');
        return {
          success: true,
          message: '同步完成，但未获取到数据',
          syncedCount: 0,
          failedCount: 0,
        };
      }

      // 批量保存数据
      const result = await this.batchSaveRechargeFeatures(externalData.items);

      this.logger.log(`同步完成，成功: ${result.successCount}, 失败: ${result.failedCount}`);

      return {
        success: true,
        message: '同步完成',
        syncedCount: result.successCount,
        failedCount: result.failedCount,
        details: result.details,
      };

    } catch (error) {
      this.logger.error(`同步用户充值功能数据失败: ${error.message}`, error.stack);
      
      // 记录同步失败状态
      await this.markSyncFailed(userIds.split(',').map(id => parseInt(id)), error.message);

      return {
        success: false,
        message: `同步失败: ${error.message}`,
        syncedCount: 0,
        failedCount: 0,
      };
    }
  }

  /**
   * 批量同步用户充值功能数据
   * @param batchSyncDto 批量同步参数
   * @returns 同步结果
   */
  async batchSyncUserRechargeFeature(batchSyncDto: BatchSyncRechargeFeatureDto) {
    const { userIds } = batchSyncDto;
    
    try {
      this.logger.log(`开始批量同步用户充值功能数据，用户数: ${userIds.length}`);

      // 调用外部API批量获取数据
      const externalData = await this.externalApiService.batchGetUserRechargeFeature(userIds);
      
      if (!externalData.items || externalData.items.length === 0) {
        this.logger.warn('批量同步：外部API返回数据为空');
        return {
          success: true,
          message: '批量同步完成，但未获取到数据',
          syncedCount: 0,
          failedCount: 0,
        };
      }

      // 批量保存数据
      const result = await this.batchSaveRechargeFeatures(externalData.items);

      this.logger.log(`批量同步完成，成功: ${result.successCount}, 失败: ${result.failedCount}`);

      return {
        success: true,
        message: '批量同步完成',
        syncedCount: result.successCount,
        failedCount: result.failedCount,
        details: result.details,
      };

    } catch (error) {
      this.logger.error(`批量同步用户充值功能数据失败: ${error.message}`, error.stack);
      
      // 记录同步失败状态
      await this.markSyncFailed(userIds, error.message);

      return {
        success: false,
        message: `批量同步失败: ${error.message}`,
        syncedCount: 0,
        failedCount: 0,
      };
    }
  }

  /**
   * 批量保存充值功能数据
   * @param items 外部API返回的数据项
   * @returns 保存结果
   */
  private async batchSaveRechargeFeatures(items: UserRechargeFeatureItem[]) {
    let successCount = 0;
    let failedCount = 0;
    const details = [];

    for (const item of items) {
      try {
        await this.saveOrUpdateRechargeFeature(item);
        successCount++;
        details.push({
          uid: item.uid,
          status: 'success',
          message: '保存成功',
        });
      } catch (error) {
        failedCount++;
        details.push({
          uid: item.uid,
          status: 'failed',
          message: error.message,
        });
        this.logger.error(`保存用户 ${item.uid} 充值功能数据失败: ${error.message}`);
      }
    }

    return { successCount, failedCount, details };
  }

  /**
   * 保存或更新单个用户的充值功能数据
   * @param item 用户充值功能数据
   */
  private async saveOrUpdateRechargeFeature(item: UserRechargeFeatureItem) {
    const existingRecord = await this.userRechargeFeatureRepository.findOne({
      where: { uid: item.uid },
    });

    const rechargeFeature = existingRecord || new UserRechargeFeature();
    
    // 更新数据
    rechargeFeature.uid = item.uid;
    rechargeFeature.totalRecharge = item.totalRecharge;
    rechargeFeature.day1Coin = item.day1Coin;
    rechargeFeature.day2Coin = item.day2Coin;
    rechargeFeature.day7Coin = item.day7Coin;
    rechargeFeature.day30Coin = item.day30Coin;
    rechargeFeature.isValuableUser = item.valuableUser;  // 映射字段名
    rechargeFeature.isHundredUser = item.hundredUser;   // 映射字段名
    rechargeFeature.registerTime = item.registerTime;
    rechargeFeature.lastSyncAt = new Date();
    rechargeFeature.syncStatus = 'success';
    rechargeFeature.syncError = null;

    await this.userRechargeFeatureRepository.save(rechargeFeature);
  }

  /**
   * 标记同步失败状态
   * @param userIds 用户ID列表
   * @param errorMessage 错误信息
   */
  private async markSyncFailed(userIds: number[], errorMessage: string) {
    try {
      for (const uid of userIds) {
        let record = await this.userRechargeFeatureRepository.findOne({
          where: { uid },
        });

        if (!record) {
          record = new UserRechargeFeature();
          record.uid = uid;
        }

        record.syncStatus = 'failed';
        record.syncError = errorMessage;
        record.lastSyncAt = new Date();

        await this.userRechargeFeatureRepository.save(record);
      }
    } catch (error) {
      this.logger.error(`标记同步失败状态时出错: ${error.message}`);
    }
  }

  /**
   * 查询用户充值功能数据
   * @param queryDto 查询参数
   * @returns 查询结果
   */
  async findUserRechargeFeatures(queryDto: RechargeFeatureQueryDto) {
    const { page = 1, limit = 10, uid, isValuableUser, isHundredUser, syncStatus } = queryDto;

    const queryBuilder = this.userRechargeFeatureRepository.createQueryBuilder('feature');

    // 添加查询条件
    if (uid) {
      queryBuilder.andWhere('feature.uid = :uid', { uid });
    }

    if (isValuableUser !== undefined) {
      queryBuilder.andWhere('feature.isValuableUser = :isValuableUser', { isValuableUser });
    }

    if (isHundredUser !== undefined) {
      queryBuilder.andWhere('feature.isHundredUser = :isHundredUser', { isHundredUser });
    }

    if (syncStatus) {
      queryBuilder.andWhere('feature.syncStatus = :syncStatus', { syncStatus });
    }

    // 分页和排序
    queryBuilder
      .orderBy('feature.lastSyncAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取单个用户充值功能数据
   * @param uid 用户ID
   * @returns 用户充值功能数据
   */
  async findUserRechargeFeatureByUid(uid: number) {
    return this.userRechargeFeatureRepository.findOne({
      where: { uid },
    });
  }

  /**
   * 删除用户充值功能数据
   * @param uid 用户ID
   */
  async deleteUserRechargeFeature(uid: number) {
    const result = await this.userRechargeFeatureRepository.delete({ uid });
    return result.affected > 0;
  }

  /**
   * 获取同步统计信息
   * @returns 统计信息
   */
  async getSyncStats() {
    const total = await this.userRechargeFeatureRepository.count();
    const successCount = await this.userRechargeFeatureRepository.count({
      where: { syncStatus: 'success' },
    });
    const failedCount = await this.userRechargeFeatureRepository.count({
      where: { syncStatus: 'failed' },
    });
    const pendingCount = await this.userRechargeFeatureRepository.count({
      where: { syncStatus: 'pending' },
    });

    // 获取最新同步时间
    const latestSync = await this.userRechargeFeatureRepository
      .createQueryBuilder('feature')
      .select('MAX(feature.lastSyncAt)', 'lastSyncAt')
      .getRawOne();

    return {
      total,
      successCount,
      failedCount,
      pendingCount,
      lastSyncAt: latestSync?.lastSyncAt,
    };
  }
}
