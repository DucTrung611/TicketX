import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingTables1786633470134 implements MigrationInterface {
  name = 'CreateBookingTables1786633470134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "bookings_status_enum" AS ENUM ('pending', 'confirmed', 'cancelled', 'expired')`,
    );

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "showtime_id" uuid NOT NULL,
        "booking_code" varchar NOT NULL,
        "status" "bookings_status_enum" NOT NULL DEFAULT 'pending',
        "voucher_code" varchar,
        "discount_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "total_amount" numeric(10,2) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "checked_in_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_bookings_users" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_bookings_showtimes" FOREIGN KEY ("showtime_id")
          REFERENCES "showtimes" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_bookings_booking_code" ON "bookings" ("booking_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_user_id_created_at" ON "bookings" ("user_id", "created_at")`,
    );

    await queryRunner.query(
      `CREATE TYPE "booking_seats_status_enum" AS ENUM ('pending', 'confirmed', 'cancelled', 'expired')`,
    );

    await queryRunner.query(`
      CREATE TABLE "booking_seats" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL,
        "showtime_id" uuid NOT NULL,
        "seat_id" uuid NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "status" "booking_seats_status_enum" NOT NULL DEFAULT 'pending',
        CONSTRAINT "PK_booking_seats_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_booking_seats_bookings" FOREIGN KEY ("booking_id")
          REFERENCES "bookings" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_booking_seats_showtimes" FOREIGN KEY ("showtime_id")
          REFERENCES "showtimes" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_booking_seats_seats" FOREIGN KEY ("seat_id")
          REFERENCES "seats" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_booking_seats_showtime_id_seat_id"
        ON "booking_seats" ("showtime_id", "seat_id")
        WHERE "status" IN ('pending', 'confirmed')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "booking_seats"`);
    await queryRunner.query(`DROP TYPE "booking_seats_status_enum"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "bookings_status_enum"`);
  }
}
