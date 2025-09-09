import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifyReportSubmissionTable1700000000005 implements MigrationInterface {
    name = 'SimplifyReportSubmissionTable1700000000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 删除现有表并重新创建简化版本
        await queryRunner.query(`DROP TABLE IF EXISTS \`report_submissions\``);
        
        // 创建简化的填报记录表
        await queryRunner.query(`
            CREATE TABLE \`report_submissions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`submitterId\` int NOT NULL COMMENT '提交人ID（当前登录用户）',
                \`tiktokAccountId\` int NOT NULL COMMENT '关联的TikTok账号ID',
                \`yaychatUserId\` bigint NOT NULL COMMENT 'YAYChat平台的用户ID',
                INDEX \`IDX_REPORT_SUBMITTER\` (\`submitterId\`),
                INDEX \`IDX_REPORT_TIKTOK_ACCOUNT\` (\`tiktokAccountId\`),
                INDEX \`IDX_REPORT_YAYCHAT_ID\` (\`yaychatUserId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB COMMENT='填报记录表（简化版）'
        `);

        // 添加外键约束
        await queryRunner.query(`
            ALTER TABLE \`report_submissions\` 
            ADD CONSTRAINT \`FK_REPORT_SUBMITTER\` 
            FOREIGN KEY (\`submitterId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`report_submissions\` 
            ADD CONSTRAINT \`FK_REPORT_TIKTOK_ACCOUNT\` 
            FOREIGN KEY (\`tiktokAccountId\`) REFERENCES \`tiktok_accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 恢复字段（如果需要回滚）
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`reportType\` enum ('account_binding', 'data_report', 'conversion_report', 'other') NOT NULL DEFAULT 'account_binding'`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`status\` enum ('pending', 'approved', 'rejected', 'processing') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`title\` varchar(200) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`content\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`additionalData\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`reviewerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`reviewedAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`reviewNotes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`priority\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`tags\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`isUrgent\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`expectedCompletionAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` ADD COLUMN \`completedAt\` timestamp NULL`);
    }
}
