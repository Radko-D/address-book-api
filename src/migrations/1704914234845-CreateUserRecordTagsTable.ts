import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreateUserRecordTagsTable1704914234845 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_record_tags',
        columns: [
          {
            name: 'user_record_id',
            type: 'uuid',
          },
          {
            name: 'tag_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    )

    // Create foreign keys
    await queryRunner.createForeignKey(
      'user_record_tags',
      new TableForeignKey({
        columnNames: ['user_record_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user_record',
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'user_record_tags',
      new TableForeignKey({
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tag',
        onDelete: 'CASCADE',
      }),
    )

    // Create primary key constraint
    await queryRunner.query(`
      ALTER TABLE "user_record_tags"
      ADD CONSTRAINT "PK_user_record_tags" 
      PRIMARY KEY ("user_record_id", "tag_id")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_record_tags')
  }
}
