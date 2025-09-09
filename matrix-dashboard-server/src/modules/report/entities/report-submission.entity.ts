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

  @ApiProperty({ description: '提交人信息', type: () => User })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'submitterId' })
  submitter: User;

  @ApiProperty({ description: '关联的TikTok账号', type: () => TiktokAccount })
  @ManyToOne(() => TiktokAccount, { eager: false })
  @JoinColumn({ name: 'tiktokAccountId' })
  tiktokAccount: TiktokAccount;
}
