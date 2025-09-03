import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRechargeFeature } from '../entities/user-recharge-feature.entity';
import { DirectApiService } from './direct-api.service';
import { UserRechargeFeatureItem } from '../dto/recharge-sync.dto';

@Injectable()
export class DirectSyncService {
  private readonly logger = new Logger(DirectSyncService.name);

  constructor(
    @InjectRepository(UserRechargeFeature)
    private userRechargeFeatureRepository: Repository<UserRechargeFeature>,
    private directApiService: DirectApiService,
  ) {}

  /**
   * 使用指定token直接同步用户充值功能数据
   * @param userIds 用户ID列表，逗号分隔
   * @param token YAY Bearer token
   * @returns 同步结果
   */
  async syncWithToken(userIds: string, token: string) {
    try {
      this.logger.log(`开始直接同步用户充值功能数据: ${userIds}`);

      // 调用外部API获取数据
      const externalData = await this.directApiService.getUserRechargeFeatureWithToken(userIds, token);
      
      if (!externalData.items || externalData.items.length === 0) {
        this.logger.warn('外部API返回数据为空');
        return {
          success: true,
          message: '同步完成，但未获取到数据',
          syncedCount: 0,
          failedCount: 0,
          data: [],
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
        data: result.savedData,
        details: result.details,
      };

    } catch (error) {
      this.logger.error(`直接同步用户充值功能数据失败: ${error.message}`, error.stack);
      
      return {
        success: false,
        message: `同步失败: ${error.message}`,
        syncedCount: 0,
        failedCount: 0,
        data: [],
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
    const savedData = [];

    for (const item of items) {
      try {
        const savedRecord = await this.saveOrUpdateRechargeFeature(item);
        successCount++;
        savedData.push(savedRecord);
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

    return { successCount, failedCount, details, savedData };
  }

  /**
   * 保存或更新单个用户的充值功能数据
   * @param item 用户充值功能数据
   * @returns 保存的记录
   */
  private async saveOrUpdateRechargeFeature(item: UserRechargeFeatureItem): Promise<UserRechargeFeature> {
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
    rechargeFeature.isValuableUser = item.valuableUser;
    rechargeFeature.isHundredUser = item.hundredUser;
    rechargeFeature.registerTime = item.registerTime;
    rechargeFeature.lastSyncAt = new Date();
    rechargeFeature.syncStatus = 'success';
    rechargeFeature.syncError = null;

    return await this.userRechargeFeatureRepository.save(rechargeFeature);
  }
}
