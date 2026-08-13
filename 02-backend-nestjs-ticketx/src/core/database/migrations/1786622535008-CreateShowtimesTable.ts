import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShowtimesTable1786622535008 implements MigrationInterface {
  name = 'CreateShowtimesTable1786622535008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "showtimes_status_enum" AS ENUM ('scheduled', 'ongoing', 'ended', 'cancelled')`,
    );

    await queryRunner.query(`
      CREATE TABLE "showtimes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "movie_id" uuid NOT NULL,
        "room_id" uuid NOT NULL,
        "start_time" timestamptz NOT NULL,
        "end_time" timestamptz NOT NULL,
        "base_price" numeric(10,2) NOT NULL,
        "status" "showtimes_status_enum" NOT NULL DEFAULT 'scheduled',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_showtimes_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_showtimes_movies" FOREIGN KEY ("movie_id")
          REFERENCES "movies" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_showtimes_rooms" FOREIGN KEY ("room_id")
          REFERENCES "rooms" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_showtimes_movie_id_start_time" ON "showtimes" ("movie_id", "start_time")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_showtimes_room_id_start_time" ON "showtimes" ("room_id", "start_time")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "showtimes"`);
    await queryRunner.query(`DROP TYPE "showtimes_status_enum"`);
  }
}
