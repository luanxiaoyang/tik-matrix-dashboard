import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // 检查权限代码是否已存在
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existingPermission) {
      throw new BadRequestException('权限代码已存在');
    }

    // 检查父级权限是否存在
    if (createPermissionDto.parentId) {
      const parentPermission = await this.permissionRepository.findOne({
        where: { id: createPermissionDto.parentId },
      });

      if (!parentPermission) {
        throw new BadRequestException('父级权限不存在');
      }
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async findTree(): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      order: { sort: 'ASC', createdAt: 'DESC' },
    });

    // 构建树形结构
    const permissionMap = new Map<number, Permission & { children?: Permission[] }>();
    const rootPermissions: (Permission & { children?: Permission[] })[] = [];

    // 初始化所有权限
    permissions.forEach(permission => {
      permissionMap.set(permission.id, { ...permission, children: [] });
    });

    // 构建树形结构
    permissions.forEach(permission => {
      const permissionWithChildren = permissionMap.get(permission.id);
      if (permission.parentId && permissionMap.has(permission.parentId)) {
        const parent = permissionMap.get(permission.parentId);
        parent.children.push(permissionWithChildren);
      } else {
        rootPermissions.push(permissionWithChildren);
      }
    });

    return rootPermissions;
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);

    // 检查权限代码是否已被其他权限使用
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });

      if (existingPermission) {
        throw new BadRequestException('权限代码已存在');
      }
    }

    // 检查父级权限是否存在
    if (updatePermissionDto.parentId) {
      // 不能将自己设置为父级
      if (updatePermissionDto.parentId === id) {
        throw new BadRequestException('不能将自己设置为父级权限');
      }

      const parentPermission = await this.permissionRepository.findOne({
        where: { id: updatePermissionDto.parentId },
      });

      if (!parentPermission) {
        throw new BadRequestException('父级权限不存在');
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);

    // 检查是否有子权限
    const childPermissions = await this.permissionRepository.find({
      where: { parentId: id },
    });

    if (childPermissions.length > 0) {
      throw new BadRequestException('该权限存在子权限，无法删除');
    }

    // 检查是否有角色使用该权限
    if (permission.roles && permission.roles.length > 0) {
      throw new BadRequestException('该权限正在被角色使用，无法删除');
    }

    await this.permissionRepository.remove(permission);
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { code },
    });
  }

  async findByCodes(codes: string[]): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.code IN (:...codes)', { codes })
      .getMany();
  }

  async findByParentId(parentId: number | null): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { parentId },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }
}
