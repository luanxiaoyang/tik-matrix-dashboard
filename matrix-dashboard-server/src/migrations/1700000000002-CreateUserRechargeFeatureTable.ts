import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRechargeFeatureTable1700000000002 implements MigrationInterface {
    name = 'CreateUserRechargeFeatureTable1700000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建用户充值功能表
        await queryRunner.query(`
            CREATE TABLE \`user_recharge_features\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` timestamp(6) NULL,
                \`uid\` bigint NOT NULL COMMENT '用户ID',
                \`totalRecharge\` bigint NOT NULL DEFAULT '0' COMMENT '总充值金额(分)',
                \`day1Coin\` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '第1天金币数',
                \`day2Coin\` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '第2天金币数',
                \`day7Coin\` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '第7天金币数',
                \`day30Coin\` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '第30天金币数',
                \`isValuableUser\` tinyint NOT NULL DEFAULT 0 COMMENT '是否为价值用户',
                \`isHundredUser\` tinyint NOT NULL DEFAULT 0 COMMENT '是否为百元用户',
                \`registerTime\` bigint NULL COMMENT '注册时间戳',
                \`lastSyncAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后同步时间',
                \`syncStatus\` enum ('pending', 'success', 'failed') NOT NULL DEFAULT 'pending' COMMENT '同步状态',
                \`syncError\` text NULL COMMENT '同步错误信息',
                UNIQUE INDEX \`IDX_USER_RECHARGE_UID\` (\`uid\`),
                INDEX \`IDX_USER_RECHARGE_REGISTER_TIME\` (\`registerTime\`),
                INDEX \`IDX_USER_RECHARGE_TOTAL\` (\`totalRecharge\`),
                INDEX \`IDX_USER_RECHARGE_SYNC_STATUS\` (\`syncStatus\`),
                INDEX \`IDX_USER_RECHARGE_LAST_SYNC\` (\`lastSyncAt\`),
                INDEX \`IDX_USER_RECHARGE_VALUABLE\` (\`isValuableUser\`),
                INDEX \`IDX_USER_RECHARGE_HUNDRED\` (\`isHundredUser\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB COMMENT='用户充值功能数据表'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除用户充值功能表
        await queryRunner.query(`DROP TABLE \`user_recharge_features\``);
    }
}
