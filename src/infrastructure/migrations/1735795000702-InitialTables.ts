import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1735795000702 implements MigrationInterface {
    name = 'InitialTables1735795000702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`item_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`item_id\` int NULL, \`category_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`borrowing_comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`comment\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`borrowing_id\` int NULL, \`stock_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, \`comment_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`role_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_borrowings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, \`borrowing_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`return_stocks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`return_id\` int NULL, \`stock_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`returns\` (\`id\` int NOT NULL AUTO_INCREMENT, \`item_id\` int NOT NULL, \`quantity\` int NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`statuses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`borrowing_returns\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`borrowing_id\` int NULL, \`return_id\` int NULL, \`status_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`borrowings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`borrowing_stocks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`borrowing_id\` int NULL, \`stock_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock_histories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`stock_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stocks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`item_id\` int NULL, UNIQUE INDEX \`REL_e31694209cc16bed37eee2b0e3\` (\`item_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`profiles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`description\` varchar(255) NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`deleted_at\` datetime(6) NULL, \`user_id\` int NULL, UNIQUE INDEX \`REL_9e432b7df0d182f8d292902d1a\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`item_categories\` ADD CONSTRAINT \`FK_a64b7fc80dae231bad4c54e00dd\` FOREIGN KEY (\`item_id\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`item_categories\` ADD CONSTRAINT \`FK_85aa6c4dd057e26e08b1d3919fd\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` ADD CONSTRAINT \`FK_664646723ccd73192bc9ebb59d0\` FOREIGN KEY (\`borrowing_id\`) REFERENCES \`borrowings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` ADD CONSTRAINT \`FK_a3af76c006fbe3abbad031c409f\` FOREIGN KEY (\`stock_id\`) REFERENCES \`stocks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_comments\` ADD CONSTRAINT \`FK_78a2857867c46e4f1f0d93c7824\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_comments\` ADD CONSTRAINT \`FK_58cebdc5381fbf95e55c1a0a66c\` FOREIGN KEY (\`comment_id\`) REFERENCES \`comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_borrowings\` ADD CONSTRAINT \`FK_3772dcb362a647f02b520fbc0d5\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_borrowings\` ADD CONSTRAINT \`FK_61d8038fc12313b1c211db81dfb\` FOREIGN KEY (\`borrowing_id\`) REFERENCES \`borrowings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`return_stocks\` ADD CONSTRAINT \`FK_264bc245a7219844a1a88b9b862\` FOREIGN KEY (\`return_id\`) REFERENCES \`returns\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`return_stocks\` ADD CONSTRAINT \`FK_80e9badc03c85c5c165cdad53a2\` FOREIGN KEY (\`stock_id\`) REFERENCES \`stocks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`borrowing_returns\` ADD CONSTRAINT \`FK_4b5f434ad4ffd86bfb19d3d2f1a\` FOREIGN KEY (\`borrowing_id\`) REFERENCES \`borrowings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`borrowing_returns\` ADD CONSTRAINT \`FK_2f5bc25606e3ccdbbd7d9357ccc\` FOREIGN KEY (\`return_id\`) REFERENCES \`returns\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`borrowing_returns\` ADD CONSTRAINT \`FK_6f8fabdd2d6c90704dee51f53c7\` FOREIGN KEY (\`status_id\`) REFERENCES \`statuses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`borrowing_stocks\` ADD CONSTRAINT \`FK_ac09ea252a23e59fce0292396cd\` FOREIGN KEY (\`borrowing_id\`) REFERENCES \`borrowings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`borrowing_stocks\` ADD CONSTRAINT \`FK_495ceb2d81402a5da3687335af7\` FOREIGN KEY (\`stock_id\`) REFERENCES \`stocks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stock_histories\` ADD CONSTRAINT \`FK_4fd7d8daae76a51e3a8c525c0bb\` FOREIGN KEY (\`stock_id\`) REFERENCES \`stocks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stocks\` ADD CONSTRAINT \`FK_e31694209cc16bed37eee2b0e3e\` FOREIGN KEY (\`item_id\`) REFERENCES \`items\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD CONSTRAINT \`FK_9e432b7df0d182f8d292902d1a2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_9e432b7df0d182f8d292902d1a2\``);
        await queryRunner.query(`ALTER TABLE \`stocks\` DROP FOREIGN KEY \`FK_e31694209cc16bed37eee2b0e3e\``);
        await queryRunner.query(`ALTER TABLE \`stock_histories\` DROP FOREIGN KEY \`FK_4fd7d8daae76a51e3a8c525c0bb\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_stocks\` DROP FOREIGN KEY \`FK_495ceb2d81402a5da3687335af7\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_stocks\` DROP FOREIGN KEY \`FK_ac09ea252a23e59fce0292396cd\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_returns\` DROP FOREIGN KEY \`FK_6f8fabdd2d6c90704dee51f53c7\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_returns\` DROP FOREIGN KEY \`FK_2f5bc25606e3ccdbbd7d9357ccc\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_returns\` DROP FOREIGN KEY \`FK_4b5f434ad4ffd86bfb19d3d2f1a\``);
        await queryRunner.query(`ALTER TABLE \`return_stocks\` DROP FOREIGN KEY \`FK_80e9badc03c85c5c165cdad53a2\``);
        await queryRunner.query(`ALTER TABLE \`return_stocks\` DROP FOREIGN KEY \`FK_264bc245a7219844a1a88b9b862\``);
        await queryRunner.query(`ALTER TABLE \`user_borrowings\` DROP FOREIGN KEY \`FK_61d8038fc12313b1c211db81dfb\``);
        await queryRunner.query(`ALTER TABLE \`user_borrowings\` DROP FOREIGN KEY \`FK_3772dcb362a647f02b520fbc0d5\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``);
        await queryRunner.query(`ALTER TABLE \`user_comments\` DROP FOREIGN KEY \`FK_58cebdc5381fbf95e55c1a0a66c\``);
        await queryRunner.query(`ALTER TABLE \`user_comments\` DROP FOREIGN KEY \`FK_78a2857867c46e4f1f0d93c7824\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` DROP FOREIGN KEY \`FK_a3af76c006fbe3abbad031c409f\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` DROP FOREIGN KEY \`FK_664646723ccd73192bc9ebb59d0\``);
        await queryRunner.query(`ALTER TABLE \`item_categories\` DROP FOREIGN KEY \`FK_85aa6c4dd057e26e08b1d3919fd\``);
        await queryRunner.query(`ALTER TABLE \`item_categories\` DROP FOREIGN KEY \`FK_a64b7fc80dae231bad4c54e00dd\``);
        await queryRunner.query(`DROP INDEX \`REL_9e432b7df0d182f8d292902d1a\` ON \`profiles\``);
        await queryRunner.query(`DROP TABLE \`profiles\``);
        await queryRunner.query(`DROP INDEX \`REL_e31694209cc16bed37eee2b0e3\` ON \`stocks\``);
        await queryRunner.query(`DROP TABLE \`stocks\``);
        await queryRunner.query(`DROP TABLE \`stock_histories\``);
        await queryRunner.query(`DROP TABLE \`borrowing_stocks\``);
        await queryRunner.query(`DROP TABLE \`borrowings\``);
        await queryRunner.query(`DROP TABLE \`borrowing_returns\``);
        await queryRunner.query(`DROP TABLE \`statuses\``);
        await queryRunner.query(`DROP TABLE \`returns\``);
        await queryRunner.query(`DROP TABLE \`return_stocks\``);
        await queryRunner.query(`DROP TABLE \`user_borrowings\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`user_comments\``);
        await queryRunner.query(`DROP TABLE \`comments\``);
        await queryRunner.query(`DROP TABLE \`borrowing_comments\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`items\``);
        await queryRunner.query(`DROP TABLE \`item_categories\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
    }

}
