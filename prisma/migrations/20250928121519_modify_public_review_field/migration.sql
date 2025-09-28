/*
  Warnings:

  - You are about to drop the column `publicText` on the `Review` table. All the data in the column will be lost.
  - Added the required column `publicReview` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Review" DROP COLUMN "publicText",
ADD COLUMN     "publicReview" TEXT NOT NULL;
