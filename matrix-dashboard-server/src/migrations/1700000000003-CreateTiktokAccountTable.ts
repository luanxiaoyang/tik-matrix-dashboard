import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTiktokAccountTable1700000000003 implements MigrationInterface {
    name = 'CreateTiktokAccountTable1700000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建TikTok账号表
        await queryRunner.query(`
            CREATE TABLE \`tiktok_accounts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`accountUrl\` varchar(500) NOT NULL COMMENT 'TikTok账号链接',
                \`accountName\` varchar(100) NULL COMMENT 'TikTok账号名称',
                \`username\` varchar(100) NULL COMMENT 'TikTok用户名',
                \`phoneNumber\` varchar(20) NULL COMMENT '绑定的手机号码',
                \`accountLevel\` enum ('A', 'B', 'C', 'D') NOT NULL COMMENT '账号等级',
                \`status\` enum ('active', 'inactive', 'banned', 'pending') NOT NULL DEFAULT 'active' COMMENT '账号状态',
                \`followersCount\` int NOT NULL DEFAULT '0' COMMENT '粉丝数量',
                \`followingCount\` int NOT NULL DEFAULT '0' COMMENT '关注数量',
                \`videoCount\` int NOT NULL DEFAULT '0' COMMENT '视频数量',
                \`likesCount\` int NOT NULL DEFAULT '0' COMMENT '获得的点赞数',
                \`operationsUserId\` int NULL COMMENT '分配的运营人员ID',
                \`conversionUserId\` int NULL COMMENT '分配的转化人员ID',
                \`notes\` text NULL COMMENT '备注信息',
                \`lastStatsUpdateAt\` timestamp NULL COMMENT '最后更新统计数据时间',
                \`isVerified\` tinyint NOT NULL DEFAULT 0 COMMENT '是否已验证账号有效性',
                \`tags\` json NULL COMMENT '账号标签',
                \`region\` varchar(100) NULL COMMENT '账号地区',
                \`language\` varchar(50) NULL COMMENT '主要使用语言',
                UNIQUE INDEX \`IDX_TIKTOK_ACCOUNT_URL\` (\`accountUrl\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_PHONE\` (\`phoneNumber\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_LEVEL\` (\`accountLevel\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_STATUS\` (\`status\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_OPERATIONS_USER\` (\`operationsUserId\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_CONVERSION_USER\` (\`conversionUserId\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_VERIFIED\` (\`isVerified\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_USERNAME\` (\`username\`),
                INDEX \`IDX_TIKTOK_ACCOUNT_FOLLOWERS\` (\`followersCount\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB COMMENT='TikTok账号管理表'
        `);

        // 添加外键约束
        await queryRunner.query(`
            ALTER TABLE \`tiktok_accounts\` 
            ADD CONSTRAINT \`FK_TIKTOK_ACCOUNT_OPERATIONS_USER\` 
            FOREIGN KEY (\`operationsUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`tiktok_accounts\` 
            ADD CONSTRAINT \`FK_TIKTOK_ACCOUNT_CONVERSION_USER\` 
            FOREIGN KEY (\`conversionUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束
        await queryRunner.query(`ALTER TABLE \`tiktok_accounts\` DROP FOREIGN KEY \`FK_TIKTOK_ACCOUNT_CONVERSION_USER\``);
        await queryRunner.query(`ALTER TABLE \`tiktok_accounts\` DROP FOREIGN KEY \`FK_TIKTOK_ACCOUNT_OPERATIONS_USER\``);
        
        // 删除表
        await queryRunner.query(`DROP TABLE \`tiktok_accounts\``);
    }
}
