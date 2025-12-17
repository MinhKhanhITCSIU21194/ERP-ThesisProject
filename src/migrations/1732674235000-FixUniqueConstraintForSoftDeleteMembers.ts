import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUniqueConstraintForSoftDeleteMembers1732674235000
  implements MigrationInterface
{
  name = "FixUniqueConstraintForSoftDeleteMembers1732674235000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the old constraint exists and drop it
    const projectMembersConstraintExists = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'project_members' AND constraint_name = 'UQ_project_members_projectId_employeeId'`
    );

    if (
      projectMembersConstraintExists &&
      projectMembersConstraintExists.length > 0
    ) {
      await queryRunner.query(
        `ALTER TABLE "project_members" DROP CONSTRAINT "UQ_project_members_projectId_employeeId"`
      );
    }

    const sprintMembersConstraintExists = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'sprint_members' AND constraint_name = 'UQ_sprint_members_sprintId_employeeId'`
    );

    if (
      sprintMembersConstraintExists &&
      sprintMembersConstraintExists.length > 0
    ) {
      await queryRunner.query(
        `ALTER TABLE "sprint_members" DROP CONSTRAINT "UQ_sprint_members_sprintId_employeeId"`
      );
    }

    // Create new partial unique indexes (only for active members - where leftAt IS NULL)
    // First check if they exist
    const projectIndexExists = await queryRunner.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'project_members' AND indexname = 'IDX_project_members_active'`
    );

    if (!projectIndexExists || projectIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_project_members_active" ON "project_members" ("projectId", "employeeId") WHERE "leftAt" IS NULL`
      );
    }

    const sprintIndexExists = await queryRunner.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'sprint_members' AND indexname = 'IDX_sprint_members_active'`
    );

    if (!sprintIndexExists || sprintIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_sprint_members_active" ON "sprint_members" ("sprintId", "employeeId") WHERE "leftAt" IS NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop partial unique indexes if they exist
    const projectIndexExists = await queryRunner.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'project_members' AND indexname = 'IDX_project_members_active'`
    );

    if (projectIndexExists && projectIndexExists.length > 0) {
      await queryRunner.query(`DROP INDEX "IDX_project_members_active"`);
    }

    const sprintIndexExists = await queryRunner.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'sprint_members' AND indexname = 'IDX_sprint_members_active'`
    );

    if (sprintIndexExists && sprintIndexExists.length > 0) {
      await queryRunner.query(`DROP INDEX "IDX_sprint_members_active"`);
    }

    // Restore old unique constraints
    const projectConstraintExists = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'project_members' AND constraint_name = 'UQ_project_members_projectId_employeeId'`
    );

    if (!projectConstraintExists || projectConstraintExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "project_members" ADD CONSTRAINT "UQ_project_members_projectId_employeeId" UNIQUE ("projectId", "employeeId")`
      );
    }

    const sprintConstraintExists = await queryRunner.query(
      `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'sprint_members' AND constraint_name = 'UQ_sprint_members_sprintId_employeeId'`
    );

    if (!sprintConstraintExists || sprintConstraintExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "sprint_members" ADD CONSTRAINT "UQ_sprint_members_sprintId_employeeId" UNIQUE ("sprintId", "employeeId")`
      );
    }
  }
}
