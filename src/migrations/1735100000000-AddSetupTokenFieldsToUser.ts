import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSetupTokenFieldsToUser1735100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add setupToken column
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "setupToken",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    // Add setupTokenExpiry column
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "setupTokenExpiry",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove setupTokenExpiry column
    await queryRunner.dropColumn("users", "setupTokenExpiry");

    // Remove setupToken column
    await queryRunner.dropColumn("users", "setupToken");
  }
}
