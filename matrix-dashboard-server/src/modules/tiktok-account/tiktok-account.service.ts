import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { TiktokAccount, AccountLevel, AccountStatus } from './entities/tiktok-account.entity';
import { User } from '../user/entities/user.entity';
import {
  CreateTiktokAccountDto,
  UpdateTiktokAccountDto,
  AssignUserDto,
  TiktokAccountQueryDto,
  BatchAssignDto,
  UpdateStatsDto,
} from './dto/tiktok-account.dto';

@Injectable()
export class TiktokAccountService {
  constructor(
    @InjectRepository(TiktokAccount)
    private tiktokAccountRepository: Repository<TiktokAccount>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateTiktokAccountDto): Promise<TiktokAccount> {
    // 检查账号链接是否已存在
    const existingAccount = await this.tiktokAccountRepository.findOne({
      where: { accountUrl: createDto.accountUrl },
    });

    if (existingAccount) {
      throw new ConflictException('该TikTok账号链接已存在');
    }

    // 验证分配的用户是否存在
    if (createDto.operationsUserId) {
      await this.validateUser(createDto.operationsUserId, '运营人员');
    }

    if (createDto.conversionUserId) {
      await this.validateUser(createDto.conversionUserId, '转化人员');
    }

    const tiktokAccount = this.tiktokAccountRepository.create(createDto);
    return this.tiktokAccountRepository.save(tiktokAccount);
  }

  async findAll(queryDto: TiktokAccountQueryDto) {
    const {
      page = 1,
      limit = 10,
      accountLevel,
      status,
      operationsUserId,
      conversionUserId,
      isVerified,
      keyword,
      region,
    } = queryDto;

    const queryBuilder = this.tiktokAccountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.operationsUser', 'operationsUser')
      .leftJoinAndSelect('account.conversionUser', 'conversionUser');

    // 添加查询条件
    if (accountLevel) {
      queryBuilder.andWhere('account.accountLevel = :accountLevel', { accountLevel });
    }

    if (status) {
      queryBuilder.andWhere('account.status = :status', { status });
    }

    if (operationsUserId) {
      queryBuilder.andWhere('account.operationsUserId = :operationsUserId', { operationsUserId });
    }

    if (conversionUserId) {
      queryBuilder.andWhere('account.conversionUserId = :conversionUserId', { conversionUserId });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('account.isVerified = :isVerified', { isVerified });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(account.accountName LIKE :keyword OR account.username LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    if (region) {
      queryBuilder.andWhere('account.region = :region', { region });
    }

    // 分页和排序
    queryBuilder
      .orderBy('account.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [accounts, total] = await queryBuilder.getManyAndCount();

    return {
      accounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<TiktokAccount> {
    const account = await this.tiktokAccountRepository.findOne({
      where: { id },
      relations: ['operationsUser', 'conversionUser'],
    });

    if (!account) {
      throw new NotFoundException('TikTok账号不存在');
    }

    return account;
  }

  async update(id: number, updateDto: UpdateTiktokAccountDto): Promise<TiktokAccount> {
    const account = await this.findOne(id);

    // 检查账号链接是否已被其他账号使用
    if (updateDto.accountUrl && updateDto.accountUrl !== account.accountUrl) {
      const existingAccount = await this.tiktokAccountRepository.findOne({
        where: { accountUrl: updateDto.accountUrl },
      });

      if (existingAccount) {
        throw new ConflictException('该TikTok账号链接已被其他账号使用');
      }
    }

    // 验证分配的用户是否存在
    if (updateDto.operationsUserId) {
      await this.validateUser(updateDto.operationsUserId, '运营人员');
    }

    if (updateDto.conversionUserId) {
      await this.validateUser(updateDto.conversionUserId, '转化人员');
    }

    Object.assign(account, updateDto);
    return this.tiktokAccountRepository.save(account);
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.tiktokAccountRepository.softRemove(account);
  }

  async assignUsers(id: number, assignDto: AssignUserDto): Promise<TiktokAccount> {
    const account = await this.findOne(id);

    // 验证分配的用户是否存在
    if (assignDto.operationsUserId) {
      await this.validateUser(assignDto.operationsUserId, '运营人员');
      account.operationsUserId = assignDto.operationsUserId;
    }

    if (assignDto.conversionUserId) {
      await this.validateUser(assignDto.conversionUserId, '转化人员');
      account.conversionUserId = assignDto.conversionUserId;
    }

    return this.tiktokAccountRepository.save(account);
  }

  async batchAssign(batchAssignDto: BatchAssignDto): Promise<void> {
    const { accountIds, operationsUserId, conversionUserId } = batchAssignDto;

    // 验证账号是否存在
    const accounts = await this.tiktokAccountRepository.findBy({
      id: In(accountIds),
    });

    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('部分TikTok账号不存在');
    }

    // 验证分配的用户是否存在
    if (operationsUserId) {
      await this.validateUser(operationsUserId, '运营人员');
    }

    if (conversionUserId) {
      await this.validateUser(conversionUserId, '转化人员');
    }

    // 批量更新
    const updateData: any = {};
    if (operationsUserId !== undefined) {
      updateData.operationsUserId = operationsUserId;
    }
    if (conversionUserId !== undefined) {
      updateData.conversionUserId = conversionUserId;
    }

    await this.tiktokAccountRepository.update(
      { id: In(accountIds) },
      updateData
    );
  }

  async updateStats(id: number, updateStatsDto: UpdateStatsDto): Promise<TiktokAccount> {
    const account = await this.findOne(id);

    account.followersCount = updateStatsDto.followersCount;
    account.followingCount = updateStatsDto.followingCount;
    account.videoCount = updateStatsDto.videoCount;
    account.likesCount = updateStatsDto.likesCount;
    account.lastStatsUpdateAt = new Date();

    return this.tiktokAccountRepository.save(account);
  }

  async updateStatus(id: number, status: AccountStatus): Promise<TiktokAccount> {
    const account = await this.findOne(id);
    account.status = status;
    return this.tiktokAccountRepository.save(account);
  }

  async getAccountsByUser(userId: number, type: 'operations' | 'conversion') {
    const whereCondition = type === 'operations' 
      ? { operationsUserId: userId }
      : { conversionUserId: userId };

    return this.tiktokAccountRepository.find({
      where: whereCondition,
      relations: ['operationsUser', 'conversionUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAccountStats() {
    const total = await this.tiktokAccountRepository.count();
    
    const levelStats = await this.tiktokAccountRepository
      .createQueryBuilder('account')
      .select('account.accountLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('account.accountLevel')
      .getRawMany();

    const statusStats = await this.tiktokAccountRepository
      .createQueryBuilder('account')
      .select('account.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('account.status')
      .getRawMany();

    const assignedStats = await this.tiktokAccountRepository
      .createQueryBuilder('account')
      .select([
        'COUNT(CASE WHEN account.operationsUserId IS NOT NULL THEN 1 END) as assignedOperations',
        'COUNT(CASE WHEN account.conversionUserId IS NOT NULL THEN 1 END) as assignedConversions',
        'COUNT(CASE WHEN account.operationsUserId IS NULL THEN 1 END) as unassignedOperations',
        'COUNT(CASE WHEN account.conversionUserId IS NULL THEN 1 END) as unassignedConversions',
        'COUNT(CASE WHEN account.isVerified = 1 THEN 1 END) as verifiedCount',
      ])
      .getRawOne();

    return {
      total,
      levelStats: levelStats.reduce((acc, item) => {
        acc[item.level] = parseInt(item.count);
        return acc;
      }, {}),
      statusStats: statusStats.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      assignedOperations: parseInt(assignedStats.assignedOperations || '0'),
      assignedConversions: parseInt(assignedStats.assignedConversions || '0'),
      unassignedOperations: parseInt(assignedStats.unassignedOperations || '0'),
      unassignedConversions: parseInt(assignedStats.unassignedConversions || '0'),
      verifiedCount: parseInt(assignedStats.verifiedCount || '0'),
    };
  }

  private async validateUser(userId: number, userType: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(`${userType}不存在`);
    }

    return user;
  }

  async findByUrl(accountUrl: string): Promise<TiktokAccount | null> {
    return this.tiktokAccountRepository.findOne({
      where: { accountUrl },
      relations: ['operationsUser', 'conversionUser'],
    });
  }

  async findByPhone(phoneNumber: string): Promise<TiktokAccount[]> {
    return this.tiktokAccountRepository.find({
      where: { phoneNumber },
      relations: ['operationsUser', 'conversionUser'],
    });
  }
}
