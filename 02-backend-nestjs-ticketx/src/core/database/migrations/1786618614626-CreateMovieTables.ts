import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMovieTables1786618614626 implements MigrationInterface {
  name = 'CreateMovieTables1786618614626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "movies_status_enum" AS ENUM ('coming_soon', 'now_showing', 'ended')`,
    );
    await queryRunner.query(
      `CREATE TYPE "movies_age_rating_enum" AS ENUM ('P', 'C13', 'C16', 'C18')`,
    );

    await queryRunner.query(`
      CREATE TABLE "movies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "description" text,
        "duration_minutes" int,
        "release_date" date,
        "age_rating" "movies_age_rating_enum",
        "poster_url" varchar,
        "trailer_url" varchar,
        "status" "movies_status_enum" NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_movies_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_movies_slug" ON "movies" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_movies_status" ON "movies" ("status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "genres" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        CONSTRAINT "PK_genres_id" PRIMARY KEY ("id"),
        CONSTRAINT "uq_genres_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "movie_genres" (
        "movie_id" uuid NOT NULL,
        "genre_id" uuid NOT NULL,
        CONSTRAINT "PK_movie_genres" PRIMARY KEY ("movie_id", "genre_id"),
        CONSTRAINT "fk_movie_genres_movies" FOREIGN KEY ("movie_id")
          REFERENCES "movies" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_movie_genres_genres" FOREIGN KEY ("genre_id")
          REFERENCES "genres" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "movie_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "rating" smallint NOT NULL,
        "comment" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" BETWEEN 1 AND 5),
        CONSTRAINT "fk_reviews_movies" FOREIGN KEY ("movie_id")
          REFERENCES "movies" ("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_reviews_users" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_reviews_movie_id" ON "reviews" ("movie_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "movie_genres"`);
    await queryRunner.query(`DROP TABLE "genres"`);
    await queryRunner.query(`DROP TABLE "movies"`);
    await queryRunner.query(`DROP TYPE "movies_age_rating_enum"`);
    await queryRunner.query(`DROP TYPE "movies_status_enum"`);
  }
}
