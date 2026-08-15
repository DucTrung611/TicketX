import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVouchersTable1786673455022 implements MigrationInterface {
  name = 'CreateVouchersTable1786673455022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "vouchers_discount_type_enum" AS ENUM ('percent', 'fixed')`,
    );

    await queryRunner.query(`
      CREATE TABLE "vouchers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" varchar NOT NULL,
        "discount_type" "vouchers_discount_type_enum" NOT NULL,
        "discount_value" numeric(10,2) NOT NULL,
        "max_discount" numeric(10,2),
        "min_order_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "valid_from" timestamptz NOT NULL,
        "valid_to" timestamptz NOT NULL,
        "usage_limit" int,
        "used_count" int NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vouchers_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_vouchers_code" ON "vouchers" ("code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vouchers"`);
    await queryRunner.query(`DROP TYPE "vouchers_discount_type_enum"`);
  }
}
