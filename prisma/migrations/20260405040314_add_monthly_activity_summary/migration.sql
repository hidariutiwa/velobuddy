-- CreateTable
CREATE TABLE "MonthlyActivitySummary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalDistance" DOUBLE PRECISION NOT NULL,
    "totalMovingTime" INTEGER NOT NULL,
    "activityCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyActivitySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyActivitySummary_userId_year_month_key" ON "MonthlyActivitySummary"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "MonthlyActivitySummary" ADD CONSTRAINT "MonthlyActivitySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
