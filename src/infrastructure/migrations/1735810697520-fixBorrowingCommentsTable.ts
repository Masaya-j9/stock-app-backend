import { MigrationInterface, QueryRunner } from "typeorm";

export class FixBorrowingCommentsTable1735810697520 implements MigrationInterface {
    name = 'FixBorrowingCommentsTable1735810697520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` DROP FOREIGN KEY \`FK_a3af76c006fbe3abbad031c409f\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` DROP COLUMN \`comment\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` DROP COLUMN \`stock_id\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` ADD \`comment_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` ADD CONSTRAINT \`FK_b4522e830949040d18412b42354\` FOREIGN KEY (\`comment_id\`) REFERENCES \`comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` DROP FOREIGN KEY \`FK_b4522e830949040d18412b42354\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` DROP COLUMN \`comment_id\``);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` ADD \`stock_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` ADD \`comment\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`borrowing_comments\` ADD CONSTRAINT \`FK_a3af76c006fbe3abbad031c409f\` FOREIGN KEY (\`stock_id\`) REFERENCES \`stocks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
