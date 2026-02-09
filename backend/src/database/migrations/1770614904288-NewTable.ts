import type { MigrationInterface, QueryRunner } from "typeorm";

export class NewTable1770614904288 implements MigrationInterface {
  name = "NewTable1770614904288";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ADD "duration" integer NOT NULL DEFAULT '30'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "duration"`);
  }
}
