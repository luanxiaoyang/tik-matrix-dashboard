import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1700000000000 implements MigrationInterface {
    name = 'InitialMigration1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建权限表
        await queryRunner.query(`
            CREATE TABLE \`permissions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`name\` varchar(100) NOT NULL COMMENT '权限名称',
                \`code\` varchar(100) NOT NULL COMMENT '权限代码',
                \`type\` enum ('menu', 'button', 'api') NOT NULL DEFAULT 'api' COMMENT '权限类型',
                \`description\` varchar(200) NULL COMMENT '权限描述',
                \`parentId\` int NULL COMMENT '父级权限ID',
                \`resource\` varchar(200) NULL COMMENT '资源路径',
                \`isActive\` tinyint NOT NULL DEFAULT 1 COMMENT '是否启用',
                \`sort\` int NOT NULL DEFAULT '0' COMMENT '排序',
                UNIQUE INDEX \`IDX_PERMISSION_CODE\` (\`code\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 创建角色表
        await queryRunner.query(`
            CREATE TABLE \`roles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`name\` varchar(50) NOT NULL COMMENT '角色名称',
                \`code\` varchar(50) NOT NULL COMMENT '角色代码',
                \`description\` varchar(200) NULL COMMENT '角色描述',
                \`isActive\` tinyint NOT NULL DEFAULT 1 COMMENT '是否启用',
                \`sort\` int NOT NULL DEFAULT '0' COMMENT '排序',
                UNIQUE INDEX \`IDX_ROLE_NAME\` (\`name\`),
                UNIQUE INDEX \`IDX_ROLE_CODE\` (\`code\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 创建用户表
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`username\` varchar(50) NOT NULL COMMENT '用户名',
                \`email\` varchar(100) NOT NULL COMMENT '邮箱',
                \`password\` varchar(255) NOT NULL COMMENT '密码',
                \`nickname\` varchar(100) NULL COMMENT '昵称',
                \`avatar\` varchar(500) NULL COMMENT '头像',
                \`status\` enum ('active', 'inactive', 'banned') NOT NULL DEFAULT 'active' COMMENT '用户状态',
                \`larkUserId\` varchar(100) NULL COMMENT 'Lark用户ID',
                \`larkUserInfo\` json NULL COMMENT 'Lark用户信息',
                \`lastLoginAt\` timestamp NULL COMMENT '最后登录时间',
                \`lastLoginIp\` varchar(45) NULL COMMENT '最后登录IP',
                \`loginCount\` int NOT NULL DEFAULT '0' COMMENT '登录次数',
                UNIQUE INDEX \`IDX_USER_USERNAME\` (\`username\`),
                UNIQUE INDEX \`IDX_USER_EMAIL\` (\`email\`),
                UNIQUE INDEX \`IDX_USER_LARK_ID\` (\`larkUserId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 创建刷新令牌表
        await queryRunner.query(`
            CREATE TABLE \`refresh_tokens\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`token\` varchar(500) NOT NULL COMMENT 'Token值',
                \`expiresAt\` timestamp NOT NULL COMMENT '过期时间',
                \`isRevoked\` tinyint NOT NULL DEFAULT 0 COMMENT '是否被撤销',
                \`userId\` int NOT NULL COMMENT '用户ID',
                \`createdIp\` varchar(45) NULL COMMENT '创建IP',
                \`userAgent\` varchar(500) NULL COMMENT 'User Agent',
                UNIQUE INDEX \`IDX_REFRESH_TOKEN\` (\`token\`),
                INDEX \`IDX_REFRESH_TOKEN_USER\` (\`userId\`),
                INDEX \`IDX_REFRESH_TOKEN_EXPIRES\` (\`expiresAt\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 创建角色权限关联表
        await queryRunner.query(`
            CREATE TABLE \`role_permissions\` (
                \`role_id\` int NOT NULL,
                \`permission_id\` int NOT NULL,
                INDEX \`IDX_ROLE_PERMISSIONS_ROLE\` (\`role_id\`),
                INDEX \`IDX_ROLE_PERMISSIONS_PERMISSION\` (\`permission_id\`),
                PRIMARY KEY (\`role_id\`, \`permission_id\`)
            ) ENGINE=InnoDB
        `);

        // 创建用户角色关联表
        await queryRunner.query(`
            CREATE TABLE \`user_roles\` (
                \`user_id\` int NOT NULL,
                \`role_id\` int NOT NULL,
                INDEX \`IDX_USER_ROLES_USER\` (\`user_id\`),
                INDEX \`IDX_USER_ROLES_ROLE\` (\`role_id\`),
                PRIMARY KEY (\`user_id\`, \`role_id\`)
            ) ENGINE=InnoDB
        `);

        // 添加外键约束
        await queryRunner.query(`
            ALTER TABLE \`refresh_tokens\` 
            ADD CONSTRAINT \`FK_REFRESH_TOKEN_USER\` 
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`role_permissions\` 
            ADD CONSTRAINT \`FK_ROLE_PERMISSIONS_ROLE\` 
            FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`role_permissions\` 
            ADD CONSTRAINT \`FK_ROLE_PERMISSIONS_PERMISSION\` 
            FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_roles\` 
            ADD CONSTRAINT \`FK_USER_ROLES_USER\` 
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_roles\` 
            ADD CONSTRAINT \`FK_USER_ROLES_ROLE\` 
            FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_USER_ROLES_ROLE\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_USER_ROLES_USER\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_ROLE_PERMISSIONS_PERMISSION\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_ROLE_PERMISSIONS_ROLE\``);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_REFRESH_TOKEN_USER\``);

        // 删除表
        await queryRunner.query(`DROP TABLE \`user_roles\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
    }
}
