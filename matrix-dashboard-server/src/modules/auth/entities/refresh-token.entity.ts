import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @ApiProperty({ description: 'Token值' })
  @Column({ unique: true, length: 500 })
  token: string;

  @ApiProperty({ description: '过期时间' })
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty({ description: '是否被撤销' })
  @Column({ default: false })
  isRevoked: boolean;

  @ApiProperty({ description: '用户ID' })
  @Column()
  userId: number;

  @ApiProperty({ description: '用户信息', type: () => User })
  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '创建IP' })
  @Column({ length: 45, nullable: true })
  createdIp?: string;

  @ApiProperty({ description: 'User Agent' })
  @Column({ length: 500, nullable: true })
  userAgent?: string;
}
