import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTiktokAccountPermissions1700000000004 implements MigrationInterface {
    name = 'AddTiktokAccountPermissions1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加TikTok账号管理相关权限，使用与现有权限一致的命名方式
        await queryRunner.query(`
            INSERT INTO \`permissions\` (\`name\`, \`code\`, \`type\`, \`description\`, \`parentId\`, \`resource\`, \`sort\`) VALUES
            ('TikTok账号管理', 'tiktok:manage', 'menu', 'TikTok账号管理菜单', NULL, '/tiktok-accounts', 8),
            ('查看TikTok账号', 'tiktok:read', 'api', '查看TikTok账号列表和详情', NULL, 'GET:/tiktok-accounts', 1),
            ('创建TikTok账号', 'tiktok:create', 'api', '创建TikTok账号', NULL, 'POST:/tiktok-accounts', 2),
            ('更新TikTok账号', 'tiktok:update', 'api', '更新TikTok账号信息', NULL, 'PATCH:/tiktok-accounts', 3),
            ('删除TikTok账号', 'tiktok:delete', 'api', '删除TikTok账号', NULL, 'DELETE:/tiktok-accounts', 4)
        `);

        // 更新子权限的parentId
        const tiktokManagePermission = await queryRunner.query(`
            SELECT id FROM permissions WHERE code = 'tiktok:manage'
        `);
        
        if (tiktokManagePermission && tiktokManagePermission.length > 0) {
            const parentId = tiktokManagePermission[0].id;
            await queryRunner.query(`
                UPDATE permissions 
                SET parentId = ?
                WHERE code IN ('tiktok:read', 'tiktok:create', 'tiktok:update', 'tiktok:delete')
            `, [parentId]);
        }

        // 为现有角色添加新的权限
        // 超级管理员拥有所有权限
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 1, \`id\` FROM \`permissions\` WHERE \`code\` IN ('tiktok:manage', 'tiktok:read', 'tiktok:create', 'tiktok:update', 'tiktok:delete')
        `);

        // 运营人员权限 (账号管理、转化数据、充值管理、TikTok账号管理)
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 2, \`id\` FROM \`permissions\` WHERE \`code\` IN ('tiktok:manage', 'tiktok:read', 'tiktok:create', 'tiktok:update', 'tiktok:delete')
        `);

        // 数据分析师权限 (查看所有数据，包括TikTok账号)
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 3, \`id\` FROM \`permissions\` WHERE \`code\` IN ('tiktok:manage', 'tiktok:read')
        `);

        // 只读用户权限 (只能查看)
        await queryRunner.query(`
            INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
            SELECT 4, \`id\` FROM \`permissions\` WHERE \`code\` IN ('tiktok:read')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除角色权限关联
        await queryRunner.query(`
            DELETE FROM \`role_permissions\` WHERE \`permission_id\` IN (
                SELECT \`id\` FROM \`permissions\` WHERE \`code\` IN (
                    'tiktok:manage', 'tiktok:read', 'tiktok:create', 'tiktok:update', 'tiktok:delete'
                )
            )
        `);
        
        // 删除权限
        await queryRunner.query(`
            DELETE FROM \`permissions\` WHERE \`code\` IN (
                'tiktok:manage', 'tiktok:read', 'tiktok:create', 'tiktok:update', 'tiktok:delete'
            )
        `);
    }
}