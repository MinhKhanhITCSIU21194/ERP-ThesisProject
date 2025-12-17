import { MigrationInterface, QueryRunner } from "typeorm";

export class FixEmployeeUniqueConstraintsForSoftDelete1733065000000
  implements MigrationInterface
{
  name = "FixEmployeeUniqueConstraintsForSoftDelete1733065000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, find the actual constraint names from the database
    const emailConstraintResult = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints 
       WHERE table_name = 'employees' AND constraint_type = 'UNIQUE' 
       AND constraint_name LIKE '%email%' OR constraint_name = 'UQ_e3d0372d1ebe64cf827743666ce'`
    );

    const codeConstraintResult = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints 
       WHERE table_name = 'employees' AND constraint_type = 'UNIQUE' 
       AND constraint_name LIKE '%employeeCode%' OR constraint_name LIKE '%employee_code%'`
    );

    // Drop the email unique constraint
    if (emailConstraintResult && emailConstraintResult.length > 0) {
      const emailConstraintName = emailConstraintResult[0].constraint_name;
      console.log(`Dropping email constraint: ${emailConstraintName}`);
      await queryRunner.query(
        `ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "${emailConstraintName}"`
      );
    }

    // Drop the employeeCode unique constraint
    if (codeConstraintResult && codeConstraintResult.length > 0) {
      const codeConstraintName = codeConstraintResult[0].constraint_name;
      console.log(`Dropping employeeCode constraint: ${codeConstraintName}`);
      await queryRunner.query(
        `ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "${codeConstraintName}"`
      );
    }

    // Create partial unique indexes that only apply to non-deleted rows
    // This allows the same email/code to exist multiple times if soft-deleted
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_employees_email_not_deleted" 
       ON "employees" ("email") 
       WHERE "deletedAt" IS NULL`
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_employees_employeeCode_not_deleted" 
       ON "employees" ("employeeCode") 
       WHERE "deletedAt" IS NULL`
    );

    console.log("Successfully created partial unique indexes for soft delete support");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the partial unique indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_employees_email_not_deleted"`
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_employees_employeeCode_not_deleted"`
    );

    // Note: We don't recreate the original unique constraints
    // because they may fail if there are duplicate soft-deleted records
    console.log("Dropped partial unique indexes");
  }
}
