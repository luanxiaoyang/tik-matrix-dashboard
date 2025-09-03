import { Entity, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from './role.entity';

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
}

@Entity('permissions')
export class Permission extends BaseEntity {
  @ApiProperty({ description: '权限名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '权限代码' })
  @Column({ unique: true, length: 100 })
  code: string;

  @ApiProperty({ description: '权限类型', enum: PermissionType })
  @Column({
    type: 'enum',
    enum: PermissionType,
    default: PermissionType.API,
  })
  type: PermissionType;

  @ApiProperty({ description: '权限描述' })
  @Column({ length: 200, nullable: true })
  description?: string;

  @ApiProperty({ description: '父级权限ID' })
  @Column({ nullable: true })
  parentId?: number;

  @ApiProperty({ description: '资源路径' })
  @Column({ length: 200, nullable: true })
  resource?: string;

  @ApiProperty({ description: '是否启用' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: '排序' })
  @Column({ default: 0 })
  sort: number;

  @ApiProperty({ description: '角色列表', type: () => [Role] })
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
