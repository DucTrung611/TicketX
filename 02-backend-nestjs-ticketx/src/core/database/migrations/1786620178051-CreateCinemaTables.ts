import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCinemaTables1786620178051 implements MigrationInterface {
  name = 'CreateCinemaTables1786620178051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "rooms_room_type_enum" AS ENUM ('standard', 'imax', '4dx')`,
    );
    await queryRunner.query(
      `CREATE TYPE "seats_seat_type_enum" AS ENUM ('standard', 'vip', 'couple')`,
    );

    await queryRunner.query(`
      CREATE TABLE "cinemas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "address" varchar NOT NULL,
        "city" varchar NOT NULL,
        "phone" varchar,
        CONSTRAINT "PK_cinemas_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "cinema_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "room_type" "rooms_room_type_enum" NOT NULL,
        "total_seats" int NOT NULL DEFAULT 0,
        CONSTRAINT "PK_rooms_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_rooms_cinemas" FOREIGN KEY ("cinema_id")
          REFERENCES "cinemas" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "seats" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "room_id" uuid NOT NULL,
        "seat_row" varchar(2) NOT NULL,
        "seat_number" int NOT NULL,
        "seat_type" "seats_seat_type_enum" NOT NULL DEFAULT 'standard',
        CONSTRAINT "PK_seats_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_seats_rooms" FOREIGN KEY ("room_id")
          REFERENCES "rooms" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_seats_room_id_seat_row_seat_number" ON "seats" ("room_id", "seat_row", "seat_number")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "seats"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "cinemas"`);
    await queryRunner.query(`DROP TYPE "seats_seat_type_enum"`);
    await queryRunner.query(`DROP TYPE "rooms_room_type_enum"`);
  }
}
