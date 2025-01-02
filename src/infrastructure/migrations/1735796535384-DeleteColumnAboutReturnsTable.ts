import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteColumnAboutReturnsTable1735796535384 implements MigrationInterface {
    name = 'DeleteColumnAboutReturnsTable1735796535384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`returns\` DROP COLUMN \`item_id\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`returns\` ADD \`item_id\` int NOT NULL`);
    }

}
