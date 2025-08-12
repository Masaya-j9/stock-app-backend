import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPrimaryKeyGenerated1754982654103 implements MigrationInterface {
    name = 'FixPrimaryKeyGenerated1754982654103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stocks\` DROP FOREIGN KEY \`FK_4b0380f648187e46feed39f24b7\``);
        await queryRunner.query(`ALTER TABLE \`stock_statuses\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`stock_statuses\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`stock_statuses\` ADD \`id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`stocks\` ADD CONSTRAINT \`FK_4b0380f648187e46feed39f24b7\` FOREIGN KEY (\`status_id\`) REFERENCES \`stock_statuses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stocks\` DROP FOREIGN KEY \`FK_4b0380f648187e46feed39f24b7\``);
        await queryRunner.query(`ALTER TABLE \`stock_statuses\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`stock_statuses\` ADD \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`stock_statuses\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`stocks\` ADD CONSTRAINT \`FK_4b0380f648187e46feed39f24b7\` FOREIGN KEY (\`status_id\`) REFERENCES \`stock_statuses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
