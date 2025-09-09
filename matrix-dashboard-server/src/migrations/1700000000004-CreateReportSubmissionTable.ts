import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportSubmissionTable1700000000004 implements MigrationInterface {
    name = 'CreateReportSubmissionTable1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建填报记录表
        await queryRunner.query(`
            CREATE TABLE \`report_submissions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`submitterId\` int NOT NULL COMMENT '提交人ID（当前登录用户）',
                \`tiktokAccountId\` int NOT NULL COMMENT '关联的TikTok账号ID',
                \`yaychatUserId\` bigint NOT NULL COMMENT 'YAYChat平台的用户ID',
                \`reportType\` enum ('account_binding', 'data_report', 'conversion_report', 'other') NOT NULL DEFAULT 'account_binding' COMMENT '填报类型',
                \`status\` enum ('pending', 'approved', 'rejected', 'processing') NOT NULL DEFAULT 'pending' COMMENT '填报状态',
                \`title\` varchar(200) NOT NULL COMMENT '填报标题',
                \`content\` text NULL COMMENT '填报详细内容',
                \`additionalData\` json NULL COMMENT '附加的JSON数据',
                \`reviewerId\` int NULL COMMENT '审核人ID',
                \`reviewedAt\` timestamp NULL COMMENT '审核时间',
                \`reviewNotes\` text NULL COMMENT '审核备注',
                \`priority\` int NOT NULL DEFAULT '0' COMMENT '处理优先级',
                \`tags\` json NULL COMMENT '填报标签',
                \`isUrgent\` tinyint NOT NULL DEFAULT 0 COMMENT '是否为紧急填报',
                \`expectedCompletionAt\` timestamp NULL COMMENT '预期完成时间',
                \`completedAt\` timestamp NULL COMMENT '实际完成时间',
                INDEX \`IDX_REPORT_SUBMITTER\` (\`submitterId\`),
                INDEX \`IDX_REPORT_TIKTOK_ACCOUNT\` (\`tiktokAccountId\`),
                INDEX \`IDX_REPORT_YAYCHAT_ID\` (\`yaychatUserId\`),
                INDEX \`IDX_REPORT_STATUS\` (\`status\`),
                INDEX \`IDX_REPORT_TYPE\` (\`reportType\`),
                INDEX \`IDX_REPORT_CREATED_AT\` (\`createdAt\`),
                INDEX \`IDX_REPORT_REVIEWER\` (\`reviewerId\`),
                INDEX \`IDX_REPORT_URGENT\` (\`isUrgent\`),
                INDEX \`IDX_REPORT_PRIORITY\` (\`priority\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB COMMENT='填报记录表'
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

        await queryRunner.query(`
            ALTER TABLE \`report_submissions\` 
            ADD CONSTRAINT \`FK_REPORT_REVIEWER\` 
            FOREIGN KEY (\`reviewerId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束
        await queryRunner.query(`ALTER TABLE \`report_submissions\` DROP FOREIGN KEY \`FK_REPORT_REVIEWER\``);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` DROP FOREIGN KEY \`FK_REPORT_TIKTOK_ACCOUNT\``);
        await queryRunner.query(`ALTER TABLE \`report_submissions\` DROP FOREIGN KEY \`FK_REPORT_SUBMITTER\``);
        
        // 删除表
        await queryRunner.query(`DROP TABLE \`report_submissions\``);
    }
}
