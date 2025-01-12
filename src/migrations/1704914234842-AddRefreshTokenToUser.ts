import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToUser1704914234842 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "refresh_token" text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN "refresh_token"
        `);
    }
}