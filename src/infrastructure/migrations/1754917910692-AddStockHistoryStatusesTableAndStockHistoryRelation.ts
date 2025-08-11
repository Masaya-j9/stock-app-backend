import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockHistoryStatusesTableAndStockHistoryRelation1754917910692 implements MigrationInterface {
    name = 'AddStockHistoryStatusesTableAndStockHistoryRelation1754917910692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`stock_history_statuses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`stock_histories\` ADD \`stock_history_status_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`stock_histories\` ADD CONSTRAINT \`FK_069e5ae8a6ae805b34a8ec6f85c\` FOREIGN KEY (\`stock_history_status_id\`) REFERENCES \`stock_history_statuses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stock_histories\` DROP FOREIGN KEY \`FK_069e5ae8a6ae805b34a8ec6f85c\``);
        await queryRunner.query(`ALTER TABLE \`stock_histories\` DROP COLUMN \`stock_history_status_id\``);
        await queryRunner.query(`DROP TABLE \`stock_history_statuses\``);
    }

}
