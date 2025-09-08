import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePhoneNumberFromTiktokAccount1700000000004 implements MigrationInterface {
    name = 'RemovePhoneNumberFromTiktokAccount1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 删除phoneNumber字段的索引
        await queryRunner.query(`
            DROP INDEX \`IDX_TIKTOK_ACCOUNT_PHONE\` ON \`tiktok_accounts\`
        `);
        
        // 删除phoneNumber字段
        await queryRunner.query(`
            ALTER TABLE \`tiktok_accounts\` DROP COLUMN \`phoneNumber\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 重新添加phoneNumber字段
        await queryRunner.query(`
            ALTER TABLE \`tiktok_accounts\` ADD \`phoneNumber\` varchar(20) NULL COMMENT '绑定的手机号码'
        `);
        
        // 重新创建phoneNumber字段的索引
        await queryRunner.query(`
            CREATE INDEX \`IDX_TIKTOK_ACCOUNT_PHONE\` ON \`tiktok_accounts\` (\`phoneNumber\`)
        `);
    }
}