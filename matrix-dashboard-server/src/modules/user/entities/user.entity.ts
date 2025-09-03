import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from '../../rbac/entities/role.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: '用户名' })
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ unique: true, length: 100 })
  email: string;

  @Exclude()
  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({ length: 100, nullable: true })
  nickname?: string;

  @ApiProperty({ description: '头像' })
  @Column({ length: 500, nullable: true })
  avatar?: string;

  @ApiProperty({ description: '用户状态', enum: UserStatus })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({ description: 'Lark用户ID' })
  @Column({ length: 100, nullable: true, unique: true })
  larkUserId?: string;

  @ApiProperty({ description: 'Lark用户信息' })
  @Column({ type: 'json', nullable: true })
  larkUserInfo?: any;

  @ApiProperty({ description: '最后登录时间' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: '最后登录IP' })
  @Column({ length: 45, nullable: true })
  lastLoginIp?: string;

  @ApiProperty({ description: '登录次数' })
  @Column({ default: 0 })
  loginCount: number;

  @ApiProperty({ description: '角色列表', type: () => [Role] })
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
