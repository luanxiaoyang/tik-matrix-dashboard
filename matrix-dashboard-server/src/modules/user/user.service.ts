import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
  AssignRolesDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // 如果指定了角色，则关联角色
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      const roles = await this.roleRepository.findBy({
        id: In(createUserDto.roleIds),
      });
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async findAll(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['roles', 'roles.permissions'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 检查用户名是否已被其他用户使用
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 更新基本信息
    Object.assign(user, updateUserDto);

    // 更新角色关联
    if (updateUserDto.roleIds !== undefined) {
      if (updateUserDto.roleIds.length > 0) {
        const roles = await this.roleRepository.findBy({
          id: In(updateUserDto.roleIds),
        });
        user.roles = roles;
      } else {
        user.roles = [];
      }
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('旧密码错误');
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.userRepository.update(id, {
      password: hashedNewPassword,
    });
  }

  async resetPassword(id: number, resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.findOne(id);

    // 加密新密码
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.userRepository.update(id, {
      password: hashedPassword,
    });
  }

  async assignRoles(id: number, assignRolesDto: AssignRolesDto): Promise<User> {
    const user = await this.findOne(id);
    const roles = await this.roleRepository.findBy({
      id: In(assignRolesDto.roleIds),
    });

    user.roles = roles;
    return this.userRepository.save(user);
  }

  async updateStatus(id: number, status: UserStatus): Promise<User> {
    const user = await this.findOne(id);
    user.status = status;
    return this.userRepository.save(user);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      return [];
    }

    const permissions = new Set<string>();
    user.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          permissions.add(permission.code);
        });
      }
    });

    return Array.from(permissions);
  }

  async hasPermission(userId: number, permissionCode: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionCode);
  }

  async hasAnyPermission(userId: number, permissionCodes: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissionCodes.some((code) => permissions.includes(code));
  }
}
