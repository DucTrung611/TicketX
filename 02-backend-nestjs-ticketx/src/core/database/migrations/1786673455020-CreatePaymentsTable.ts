import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1786673455020 implements MigrationInterface {
  name = 'CreatePaymentsTable1786673455020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "payments_provider_enum" AS ENUM ('vnpay', 'momo', 'stripe')`,
    );
    await queryRunner.query(
      `CREATE TYPE "payments_status_enum" AS ENUM ('pending', 'success', 'failed', 'refunded')`,
    );

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "provider" "payments_provider_enum" NOT NULL,
        "provider_transaction_id" varchar NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "status" "payments_status_enum" NOT NULL DEFAULT 'pending',
        "paid_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_payments_bookings" FOREIGN KEY ("booking_id")
          REFERENCES "bookings" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_payments_booking_id" ON "payments" ("booking_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payments_provider_transaction_id" ON "payments" ("provider_transaction_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "payments_provider_enum"`);
  }
}
