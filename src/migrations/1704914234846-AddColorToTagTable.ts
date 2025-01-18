import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorToTagTable1704914234846 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tag"
            ADD COLUMN "color" text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tag"
            DROP COLUMN "color"
        `);
    }
}