import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreateUserRecordsTable1704900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_record',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'first_name',
            type: 'text',
          },
          {
            name: 'last_name',
            type: 'text',
          },
          {
            name: 'company_name',
            type: 'text',
          },
          {
            name: 'address',
            type: 'text',
          },
          {
            name: 'phone_number',
            type: 'text',
          },
          {
            name: 'email',
            type: 'text',
            isUnique: true,
          },
          {
            name: 'fax_number',
            type: 'text',
          },
          {
            name: 'mobile_phone_number',
            type: 'text',
          },
          {
            name: 'comment',
            type: 'text',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    )

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'user_record',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    )

    // Reuse the same trigger for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_user_record_updated_at
        BEFORE UPDATE ON user_record
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_user_record_updated_at ON user_record`)
    await queryRunner.dropTable('user_record')
  }
}
