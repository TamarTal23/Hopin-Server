import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTaskEstimatedDaysToFloat1775200000000 implements MigrationInterface {
  name = 'AlterTaskEstimatedDaysToFloat1775200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "task"
      ALTER COLUMN "estimated_days" TYPE float
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "task"
      ALTER COLUMN "estimated_days" TYPE integer USING estimated_days::integer
    `);
  }
}
