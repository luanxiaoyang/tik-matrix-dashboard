import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { TiktokAccount } from '../../tiktok-account/entities/tiktok-account.entity';

@Entity('report_submissions')
@Index('IDX_REPORT_SUBMITTER', ['submitterId'])
@Index('IDX_REPORT_TIKTOK_ACCOUNT', ['tiktokAccountId'])
@Index('IDX_REPORT_YAYCHAT_ID', ['yaychatUserId'])
export class ReportSubmission extends BaseEntity {
  @ApiProperty({ description: '提交人ID' })
  @Column({ comment: '提交人ID（当前登录用户）' })
  submitterId: number;

  @ApiProperty({ description: '关联的TikTok账号ID' })
  @Column({ comment: '关联的TikTok账号ID' })
  tiktokAccountId: number;

  @ApiProperty({ description: 'YAYChat用户ID' })
  @Column({ type: 'bigint', comment: 'YAYChat平台的用户ID' })
  yaychatUserId: number;

  @ApiProperty({ description: '提交数据' })
  @Column({ type: 'json', comment: '提交的转化数据', nullable: true })
  submissionData: Record<string, any>;

  @ApiProperty({ description: '状态' })
  @Column({ 
    type: 'enum', 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    comment: '记录状态：pending-待处理，approved-已通过，rejected-已拒绝'
  })
  status: 'pending' | 'approved' | 'rejected';

  @ApiProperty({ description: '提交时间' })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', comment: '提交时间' })
  submittedAt: Date;

  @ApiProperty({ description: '处理时间' })
  @Column({ type: 'datetime', nullable: true, comment: '处理时间' })
  reviewedAt?: Date;

  @ApiProperty({ description: '处理人' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '处理人' })
  reviewedBy?: string;

  @ApiProperty({ description: '处理备注' })
  @Column({ type: 'text', nullable: true, comment: '处理备注' })
  reviewNotes?: string;

  @ApiProperty({ description: '提交人信息', type: () => User })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'submitterId' })
  submitter: User;

  @ApiProperty({ description: '关联的TikTok账号', type: () => TiktokAccount })
  @ManyToOne(() => TiktokAccount, { eager: false })
  @JoinColumn({ name: 'tiktokAccountId' })
  tiktokAccount: TiktokAccount;
}
