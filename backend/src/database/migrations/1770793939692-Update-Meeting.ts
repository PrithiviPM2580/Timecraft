import type { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMeeting1770793939692 implements MigrationInterface {
    name = 'UpdateMeeting1770793939692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" ALTER COLUMN "status" DROP DEFAULT`);
    }

}
