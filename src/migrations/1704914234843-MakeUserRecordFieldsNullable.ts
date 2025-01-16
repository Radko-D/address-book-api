import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserRecordFieldsNullable1704914234843 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_record" 
            ALTER COLUMN "last_name" DROP NOT NULL,
            ALTER COLUMN "company_name" DROP NOT NULL,
            ALTER COLUMN "address" DROP NOT NULL,
            ALTER COLUMN "email" DROP NOT NULL,
            ALTER COLUMN "fax_number" DROP NOT NULL,
            ALTER COLUMN "mobile_phone_number" DROP NOT NULL,
            ALTER COLUMN "comment" DROP NOT NULL;
        `);

        const tableConstraints = await queryRunner.query(
            `SELECT constraint_name 
             FROM information_schema.table_constraints 
             WHERE table_name = 'user_record' 
             AND constraint_type = 'UNIQUE'
             AND constraint_name LIKE '%email%'`
        );

        if (tableConstraints.length > 0) {
            await queryRunner.query(`
                ALTER TABLE "user_record"
                DROP CONSTRAINT "${tableConstraints[0].constraint_name}"
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_record" 
            ALTER COLUMN "last_name" SET NOT NULL,
            ALTER COLUMN "company_name" SET NOT NULL,
            ALTER COLUMN "address" SET NOT NULL,
            ALTER COLUMN "email" SET NOT NULL,
            ALTER COLUMN "fax_number" SET NOT NULL,
            ALTER COLUMN "mobile_phone_number" SET NOT NULL,
            ALTER COLUMN "comment" SET NOT NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "user_record"
            ADD CONSTRAINT "UQ_user_record_email" UNIQUE ("email")
        `);
    }
}