/*
  Warnings:

  - You are about to drop the column `businessHoursFrom` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `businessHoursTo` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Place` table. All the data in the column will be lost.
  - You are about to alter the column `latitude` on the `Place` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `longitude` on the `Place` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - A unique constraint covering the columns `[googlePlaceId]` on the table `Place` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googlePlaceId` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "polyline" TEXT;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "businessHoursFrom",
DROP COLUMN "businessHoursTo",
DROP COLUMN "description",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "googlePlaceId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "latitude" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "longitude" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Place_googlePlaceId_key" ON "Place"("googlePlaceId");
