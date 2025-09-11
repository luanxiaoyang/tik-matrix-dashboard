import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportSubmission } from './entities/report-submission.entity';
import { User } from '../user/entities/user.entity';
import { TiktokAccount } from '../tiktok-account/entities/tiktok-account.entity';
import {
  CreateReportSubmissionDto,
  ReportQueryDto,
} from './dto/report-submission.dto';

@Injectable()
export class ReportSubmissionService {
  constructor(
    @InjectRepository(ReportSubmission)
    private reportRepository: Repository<ReportSubmission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TiktokAccount)
    private tiktokAccountRepository: Repository<TiktokAccount>,
  ) {}

  async create(
    createDto: CreateReportSubmissionDto,
    submitterId: number,
  ): Promise<ReportSubmission> {
    // 验证TikTok账号是否存在
    const tiktokAccount = await this.tiktokAccountRepository.findOne({
      where: { id: createDto.tiktokAccountId },
    });

    if (!tiktokAccount) {
      throw new BadRequestException('TikTok账号不存在');
    }

    const report = this.reportRepository.create({
      submitterId,
      tiktokAccountId: createDto.tiktokAccountId,
      yaychatUserId: createDto.yaychatUserId,
      submissionData: createDto.submissionData || {},
    });

    return this.reportRepository.save(report);
  }

  async findAll(queryDto: ReportQueryDto) {
    const {
      page = 1,
      limit = 10,
      submitterId,
      tiktokAccountId,
      yaychatUserId,
    } = queryDto;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.submitter', 'submitter')
      .leftJoinAndSelect('report.tiktokAccount', 'tiktokAccount');

    // 添加查询条件
    if (submitterId) {
      queryBuilder.andWhere('report.submitterId = :submitterId', { submitterId });
    }

    if (tiktokAccountId) {
      queryBuilder.andWhere('report.tiktokAccountId = :tiktokAccountId', { tiktokAccountId });
    }

    if (yaychatUserId) {
      queryBuilder.andWhere('report.yaychatUserId = :yaychatUserId', { yaychatUserId });
    }

    // 按创建时间倒序排列
    queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    return {
      items: reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ReportSubmission> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['submitter', 'tiktokAccount'],
    });

    if (!report) {
      throw new NotFoundException('填报记录不存在');
    }

    return report;
  }

  async remove(id: number): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.softRemove(report);
  }

  async findByYaychatUserId(yaychatUserId: number) {
    return this.reportRepository.find({
      where: { yaychatUserId },
      relations: ['submitter', 'tiktokAccount'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTiktokAccountId(tiktokAccountId: number) {
    return this.reportRepository.find({
      where: { tiktokAccountId },
      relations: ['submitter', 'tiktokAccount'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReportStats() {
    const total = await this.reportRepository.count();
    
    const todayCount = await this.reportRepository
      .createQueryBuilder('report')
      .where('DATE(report.createdAt) = CURDATE()')
      .getCount();

    return {
      total,
      todayCount,
    };
  }
}
