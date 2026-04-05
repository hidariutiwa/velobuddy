-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "activityAt",
DROP COLUMN "averageVelocity",
DROP COLUMN "burnCalories",
DROP COLUMN "drivingTime",
DROP COLUMN "elevation",
DROP COLUMN "maxVelocity",
ADD COLUMN     "averageCadence" DOUBLE PRECISION,
ADD COLUMN     "averageHeartrate" DOUBLE PRECISION,
ADD COLUMN     "averageSpeed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "averageTemp" DOUBLE PRECISION,
ADD COLUMN     "averageWatts" DOUBLE PRECISION,
ADD COLUMN     "calories" DOUBLE PRECISION,
ADD COLUMN     "commute" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deviceWatts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "elapsedTime" INTEGER NOT NULL,
ADD COLUMN     "elevHigh" DOUBLE PRECISION,
ADD COLUMN     "elevLow" DOUBLE PRECISION,
ADD COLUMN     "endLatlng" JSONB,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "gearId" TEXT,
ADD COLUMN     "hasHeartrate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kilojoules" DOUBLE PRECISION,
ADD COLUMN     "manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxHeartrate" DOUBLE PRECISION,
ADD COLUMN     "maxSpeed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "movingTime" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "sportType" TEXT NOT NULL DEFAULT 'Ride',
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "startLatlng" JSONB,
ADD COLUMN     "stravaId" BIGINT,
ADD COLUMN     "summaryPolyline" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "totalElevationGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "trainer" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ActivitySplit" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "split" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elevationDifference" DOUBLE PRECISION NOT NULL,
    "averageSpeed" DOUBLE PRECISION NOT NULL,
    "paceZone" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ActivitySplit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySplit_activityId_split_key" ON "ActivitySplit"("activityId", "split");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaId_key" ON "Activity"("stravaId");

-- AddForeignKey
ALTER TABLE "ActivitySplit" ADD CONSTRAINT "ActivitySplit_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

