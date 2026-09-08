-- Full-text search: `to_tsvector(regconfig, text)` is STABLE, not IMMUTABLE,
-- so it can't back a Postgres GENERATED column. Use a BEFORE INSERT/UPDATE
-- trigger instead — the classic, well-documented pattern for keeping a
-- weighted tsvector column in sync — then index it for ranked search
-- (used by the /menu search bar via ts_rank).
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

CREATE OR REPLACE FUNCTION product_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('russian', coalesce(NEW."name", '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(NEW."description", '')), 'B') ||
    setweight(to_tsvector('russian', array_to_string(NEW."tastingNotes", ' ')), 'C') ||
    setweight(to_tsvector('russian', array_to_string(NEW."tags", ' ')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "name", "description", "tastingNotes", "tags"
  ON "Product"
  FOR EACH ROW
  EXECUTE FUNCTION product_search_vector_update();

UPDATE "Product" SET "searchVector" =
  setweight(to_tsvector('russian', coalesce("name", '')), 'A') ||
  setweight(to_tsvector('russian', coalesce("description", '')), 'B') ||
  setweight(to_tsvector('russian', array_to_string("tastingNotes", ' ')), 'C') ||
  setweight(to_tsvector('russian', array_to_string("tags", ' ')), 'C');

CREATE INDEX "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");
