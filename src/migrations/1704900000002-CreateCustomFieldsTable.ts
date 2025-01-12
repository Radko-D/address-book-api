import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreateCustomFieldsTable1704900000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'custom_field',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'text',
          },
          {
            name: 'value',
            type: 'text',
          },
          {
            name: 'record_id',
            type: 'uuid',
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
        ],
      }),
      true,
    )

    // Create foreign key to user_records table
    await queryRunner.createForeignKey(
      'custom_field',
      new TableForeignKey({
        columnNames: ['record_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user_record',
        onDelete: 'CASCADE',
      }),
    )

    // Reuse the same trigger for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_custom_field_updated_at
        BEFORE UPDATE ON custom_field
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_custom_field_updated_at ON custom_field`)
    await queryRunner.dropTable('custom_field')
  }
}
