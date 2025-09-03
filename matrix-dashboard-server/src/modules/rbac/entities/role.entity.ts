import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @ApiProperty({ description: '角色名称' })
  @Column({ unique: true, length: 50 })
  name: string;

  @ApiProperty({ description: '角色代码' })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({ description: '角色描述' })
  @Column({ length: 200, nullable: true })
  description?: string;

  @ApiProperty({ description: '是否启用' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ description: '用户列表', type: () => [User] })
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ApiProperty({ description: '权限列表', type: () => [Permission] })
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}
