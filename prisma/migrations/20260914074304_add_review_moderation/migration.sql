-- DropIndex
DROP INDEX "Product_searchVector_idx";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;
