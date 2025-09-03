import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('user_recharge_features')
@Index('IDX_USER_RECHARGE_UID', ['uid'])
@Index('IDX_USER_RECHARGE_REGISTER_TIME', ['registerTime'])
@Index('IDX_USER_RECHARGE_TOTAL', ['totalRecharge'])
export class UserRechargeFeature extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({ type: 'bigint', unique: true })
  uid: number;

  @ApiProperty({ description: '总充值金额' })
  @Column({ type: 'bigint', default: 0, comment: '总充值金额(分)' })
  totalRecharge: number;

  @ApiProperty({ description: '第1天金币数' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '第1天金币数' })
  day1Coin: number;

  @ApiProperty({ description: '第2天金币数' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '第2天金币数' })
  day2Coin: number;

  @ApiProperty({ description: '第7天金币数' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '第7天金币数' })
  day7Coin: number;

  @ApiProperty({ description: '第30天金币数' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '第30天金币数' })
  day30Coin: number;

  @ApiProperty({ description: '是否为价值用户' })
  @Column({ type: 'boolean', default: false, comment: '是否为价值用户' })
  isValuableUser: boolean;

  @ApiProperty({ description: '是否为百元用户' })
  @Column({ type: 'boolean', default: false, comment: '是否为百元用户' })
  isHundredUser: boolean;

  @ApiProperty({ description: '注册时间' })
  @Column({ type: 'bigint', nullable: true, comment: '注册时间戳' })
  registerTime: number;

  @ApiProperty({ description: '最后同步时间' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: '最后同步时间' })
  lastSyncAt: Date;

  @ApiProperty({ description: '同步状态' })
  @Column({ 
    type: 'enum', 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending',
    comment: '同步状态'
  })
  syncStatus: 'pending' | 'success' | 'failed';

  @ApiProperty({ description: '同步错误信息' })
  @Column({ type: 'text', nullable: true, comment: '同步错误信息' })
  syncError: string;
}
