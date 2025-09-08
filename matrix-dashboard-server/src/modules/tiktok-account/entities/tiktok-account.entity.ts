import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

export enum AccountLevel {
  A = 'A',
  B = 'B', 
  C = 'C',
  D = 'D',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  PENDING = 'pending',
}

@Entity('tiktok_accounts')

@Index('IDX_TIKTOK_ACCOUNT_LEVEL', ['accountLevel'])
@Index('IDX_TIKTOK_ACCOUNT_STATUS', ['status'])
@Index('IDX_TIKTOK_ACCOUNT_OPERATIONS_USER', ['operationsUserId'])
@Index('IDX_TIKTOK_ACCOUNT_CONVERSION_USER', ['conversionUserId'])
export class TiktokAccount extends BaseEntity {
  @ApiProperty({ description: 'TikTok账号链接' })
  @Column({ length: 500, comment: 'TikTok账号链接' })
  accountUrl: string;

  @ApiProperty({ description: 'TikTok账号名称' })
  @Column({ length: 100, nullable: true, comment: 'TikTok账号名称' })
  accountName?: string;

  @ApiProperty({ description: 'TikTok用户名(@username)' })
  @Column({ length: 100, nullable: true, comment: 'TikTok用户名' })
  username?: string;



  @ApiProperty({ description: '账号等级', enum: AccountLevel })
  @Column({
    type: 'enum',
    enum: AccountLevel,
    comment: '账号等级 A/B/C/D',
  })
  accountLevel: AccountLevel;

  @ApiProperty({ description: '账号状态', enum: AccountStatus })
  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    comment: '账号状态',
  })
  status: AccountStatus;

  @ApiProperty({ description: '粉丝数量' })
  @Column({ type: 'int', default: 0, comment: '粉丝数量' })
  followersCount: number;

  @ApiProperty({ description: '关注数量' })
  @Column({ type: 'int', default: 0, comment: '关注数量' })
  followingCount: number;

  @ApiProperty({ description: '视频数量' })
  @Column({ type: 'int', default: 0, comment: '视频数量' })
  videoCount: number;

  @ApiProperty({ description: '点赞数量' })
  @Column({ type: 'int', default: 0, comment: '获得的点赞数' })
  likesCount: number;

  @ApiProperty({ description: '分配的运营人员ID' })
  @Column({ nullable: true, comment: '分配的运营人员ID' })
  operationsUserId?: number;

  @ApiProperty({ description: '分配的转化人员ID' })
  @Column({ nullable: true, comment: '分配的转化人员ID' })
  conversionUserId?: number;

  @ApiProperty({ description: '运营人员信息', type: () => User })
  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'operationsUserId' })
  operationsUser?: User;

  @ApiProperty({ description: '转化人员信息', type: () => User })
  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'conversionUserId' })
  conversionUser?: User;

  @ApiProperty({ description: '备注信息' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  notes?: string;

  @ApiProperty({ description: '最后更新统计数据时间' })
  @Column({ type: 'timestamp', nullable: true, comment: '最后更新统计数据时间' })
  lastStatsUpdateAt?: Date;

  @ApiProperty({ description: '是否已验证' })
  @Column({ default: false, comment: '是否已验证账号有效性' })
  isVerified: boolean;

  @ApiProperty({ description: '标签' })
  @Column({ type: 'json', nullable: true, comment: '账号标签' })
  tags?: string[];

  @ApiProperty({ description: '地区信息' })
  @Column({ length: 100, nullable: true, comment: '账号地区' })
  region?: string;

  @ApiProperty({ description: '语言' })
  @Column({ length: 50, nullable: true, comment: '主要使用语言' })
  language?: string;
}
