import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedInitialData1700000000001 implements MigrationInterface {
    name = 'SeedInitialData1700000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 插入基础权限数据
        await queryRunner.query(`
            INSERT INTO \`permissions\` (\`name\`, \`code\`, \`type\`, \`description\`, \`parentId\`, \`resource\`, \`sort\`) VALUES
            -- 用户管理权限
            ('用户管理', 'user:manage', 'menu', '用户管理菜单', NULL, '/users', 1),
            ('查看用户', 'user:read', 'api', '查看用户列表和详情', 1, 'GET:/users', 1),
            ('创建用户', 'user:create', 'api', '创建新用户', 1, 'POST:/users', 2),
            ('更新用户', 'user:update', 'api', '更新用户信息', 1, 'PATCH:/users', 3),
            ('删除用户', 'user:delete', 'api', '删除用户', 1, 'DELETE:/users', 4),
            
            -- 角色管理权限
            ('角色管理', 'role:manage', 'menu', '角色管理菜单', NULL, '/roles', 2),
            ('查看角色', 'role:read', 'api', '查看角色列表和详情', 6, 'GET:/roles', 1),
            ('创建角色', 'role:create', 'api', '创建新角色', 6, 'POST:/roles', 2),
            ('更新角色', 'role:update', 'api', '更新角色信息', 6, 'PATCH:/roles', 3),
            ('删除角色', 'role:delete', 'api', '删除角色', 6, 'DELETE:/roles', 4),
            
            -- 权限管理权限
            ('权限管理', 'permission:manage', 'menu', '权限管理菜单', NULL, '/permissions', 3),
            ('查看权限', 'permission:read', 'api', '查看权限列表和详情', 11, 'GET:/permissions', 1),
            ('创建权限', 'permission:create', 'api', '创建新权限', 11, 'POST:/permissions', 2),
            ('更新权限', 'permission:update', 'api', '更新权限信息', 11, 'PATCH:/permissions', 3),
            ('删除权限', 'permission:delete', 'api', '删除权限', 11, 'DELETE:/permissions', 4),
            
            -- 系统管理权限
            ('系统管理', 'system:manage', 'menu', '系统管理菜单', NULL, '/system', 4),
            ('系统监控', 'system:monitor', 'api', '查看系统监控信息', 16, 'GET:/system/monitor', 1),
            ('系统配置', 'system:config', 'api', '系统配置管理', 16, 'GET:/system/config', 2),
            
            -- 账号管理权限 (TikTok相关)
            ('账号管理', 'account:manage', 'menu', 'TikTok账号管理菜单', NULL, '/accounts', 5),
            ('查看账号', 'account:read', 'api', '查看TikTok账号列表和详情', 19, 'GET:/accounts', 1),
            ('创建账号', 'account:create', 'api', '创建TikTok账号', 19, 'POST:/accounts', 2),
            ('更新账号', 'account:update', 'api', '更新TikTok账号信息', 19, 'PATCH:/accounts', 3),
            ('删除账号', 'account:delete', 'api', '删除TikTok账号', 19, 'DELETE:/accounts', 4),
            
            -- 转化数据权限
            ('转化数据', 'conversion:manage', 'menu', '转化数据管理菜单', NULL, '/conversions', 6),
            ('查看转化', 'conversion:read', 'api', '查看转化数据', 24, 'GET:/conversions', 1),
            ('创建转化', 'conversion:create', 'api', '创建转化记录', 24, 'POST:/conversions', 2),
            ('更新转化', 'conversion:update', 'api', '更新转化记录', 24, 'PATCH:/conversions', 3),
            ('删除转化', 'conversion:delete', 'api', '删除转化记录', 24, 'DELETE:/conversions', 4),
            
            -- 充值功能权限
            ('充值管理', 'recharge:manage', 'menu', '充值功能管理菜单', NULL, '/recharge', 7),
            ('查看充值', 'recharge:read', 'api', '查看充值功能数据', 28, 'GET:/recharge', 1),
            ('创建充值', 'recharge:create', 'api', '创建充值功能', 28, 'POST:/recharge', 2),
            ('更新充值', 'recharge:update', 'api', '更新充值功能', 28, 'PATCH:/recharge', 3),
            ('删除充值', 'recharge:delete', 'api', '删除充值功能', 28, 'DELETE:/recharge', 4)
        `);

        // 插入基础角色数据
        await queryRunner.query(`
            INSERT INTO \`roles\` (\`name\`, \`code\`, \`description\`, \`sort\`) VALUES
            ('超级管理员', 'admin', '拥有系统所有权限的超级管理员', 1),
            ('运营人员', 'ops', '负责日常运营管理的人员', 2),
            ('数据分析师', 'analyst', '负责数据分析的人员', 3),
            ('只读用户', 'viewer', '只能查看数据的用户', 4)
        `);

        // 为角色分配权限
        // 超级管理员拥有所有权限
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 1, \`id\` FROM \`permissions\`
        `);

        // 运营人员权限 (账号管理、转化数据、充值管理)
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 2, \`id\` FROM \`permissions\`
            WHERE \`code\` IN (
                'account:manage', 'account:read', 'account:create', 'account:update', 'account:delete',
                'conversion:manage', 'conversion:read', 'conversion:create', 'conversion:update',
                'recharge:manage', 'recharge:read', 'recharge:create', 'recharge:update',
                'user:read'
            )
        `);

        // 数据分析师权限 (查看所有数据，部分更新权限)
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 3, \`id\` FROM \`permissions\`
            WHERE \`code\` IN (
                'account:manage', 'account:read', 'account:update',
                'conversion:manage', 'conversion:read', 'conversion:update',
                'recharge:manage', 'recharge:read', 'recharge:update',
                'system:monitor', 'user:read'
            )
        `);

        // 只读用户权限 (只能查看)
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 4, \`id\` FROM \`permissions\`
            WHERE \`code\` IN (
                'account:read', 'conversion:read', 'recharge:read'
            )
        `);

        // 创建默认管理员账号
        // 预先哈希的密码 'admin123' (bcrypt hash with salt rounds 10)
        const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        
        await queryRunner.query(`
            INSERT INTO \`users\` (
                \`username\`, \`email\`, \`password\`, \`nickname\`, \`status\`, \`loginCount\`
            ) VALUES (
                '${process.env.ADMIN_USERNAME || 'admin'}',
                '${process.env.ADMIN_EMAIL || 'admin@matrix.com'}',
                '${hashedPassword}',
                '系统管理员',
                'active',
                0
            )
        `);

        // 为管理员分配超级管理员角色
        await queryRunner.query(`
            INSERT INTO \`user_roles\` (\`user_id\`, \`role_id\`) VALUES (1, 1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除用户角色关联
        await queryRunner.query(`DELETE FROM \`user_roles\``);
        
        // 删除角色权限关联
        await queryRunner.query(`DELETE FROM \`role_permissions\``);
        
        // 删除用户
        await queryRunner.query(`DELETE FROM \`users\``);
        
        // 删除角色
        await queryRunner.query(`DELETE FROM \`roles\``);
        
        // 删除权限
        await queryRunner.query(`DELETE FROM \`permissions\``);
    }
}
