import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingCombosTable1786673455023 implements MigrationInterface {
  name = 'CreateBookingCombosTable1786673455023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "booking_combos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "combo_id" uuid NOT NULL,
        "quantity" int NOT NULL,
        "price" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_booking_combos_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_booking_combos_bookings" FOREIGN KEY ("booking_id")
          REFERENCES "bookings" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_booking_combos_combos" FOREIGN KEY ("combo_id")
          REFERENCES "combos" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_booking_combos_booking_id" ON "booking_combos" ("booking_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "booking_combos"`);
  }
}
