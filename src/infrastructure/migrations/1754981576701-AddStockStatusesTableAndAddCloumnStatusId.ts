import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockStatusesTableAndAddCloumnStatusId1754981576701 implements MigrationInterface {
    name = 'AddStockStatusesTableAndAddCloumnStatusId1754981576701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`stock_statuses\` (\`id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`stocks\` ADD \`status_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`stocks\` ADD CONSTRAINT \`FK_4b0380f648187e46feed39f24b7\` FOREIGN KEY (\`status_id\`) REFERENCES \`stock_statuses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stocks\` DROP FOREIGN KEY \`FK_4b0380f648187e46feed39f24b7\``);
        await queryRunner.query(`ALTER TABLE \`stocks\` DROP COLUMN \`status_id\``);
        await queryRunner.query(`DROP TABLE \`stock_statuses\``);
    }

}
