import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // 检查角色代码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { code: createRoleDto.code },
    });

    if (existingRole) {
      throw new BadRequestException('角色代码已存在');
    }

    const role = this.roleRepository.create(createRoleDto);

    // 如果指定了权限，则关联权限
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissionIds),
      });
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // 检查角色代码是否已被其他角色使用
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code },
      });

      if (existingRole) {
        throw new BadRequestException('角色代码已存在');
      }
    }

    // 更新基本信息
    Object.assign(role, updateRoleDto);

    // 更新权限关联
    if (updateRoleDto.permissionIds !== undefined) {
      if (updateRoleDto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(updateRoleDto.permissionIds),
        });
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);

    // 检查是否有用户使用该角色
    if (role.users && role.users.length > 0) {
      throw new BadRequestException('该角色正在被用户使用，无法删除');
    }

    await this.roleRepository.remove(role);
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { code },
      relations: ['permissions'],
    });
  }

  async findByCodes(codes: string[]): Promise<Role[]> {
    return this.roleRepository.find({
      where: { code: In(codes) },
      relations: ['permissions'],
    });
  }

  async addPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
    const role = await this.findOne(roleId);
    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });

    // 合并权限，避免重复
    const existingPermissionIds = role.permissions.map((p) => p.id);
    const newPermissions = permissions.filter(
      (p) => !existingPermissionIds.includes(p.id),
    );

    role.permissions = [...role.permissions, ...newPermissions];

    return this.roleRepository.save(role);
  }

  async removePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);

    role.permissions = role.permissions.filter(
      (p) => !permissionIds.includes(p.id),
    );

    return this.roleRepository.save(role);
  }
}
