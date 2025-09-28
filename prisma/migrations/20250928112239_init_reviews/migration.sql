-- CreateEnum
CREATE TYPE "public"."ReviewSource" AS ENUM ('HOSTAWAY', 'GOOGLE');

-- CreateEnum
CREATE TYPE "public"."ReviewType" AS ENUM ('HOST_TO_GUEST', 'GUEST_TO_HOST');

-- CreateEnum
CREATE TYPE "public"."ReviewChannel" AS ENUM ('AIRBNB', 'BOOKING', 'DIRECT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."ReviewCategoryType" AS ENUM ('CLEANLINESS', 'COMMUNICATION', 'ACCURACY', 'CHECKIN', 'LOCATION', 'VALUE', 'RESPECT_HOUSE_RULES', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Listing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hostawayListingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "source" "public"."ReviewSource" NOT NULL,
    "sourceReviewId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" "public"."ReviewType" NOT NULL,
    "channel" "public"."ReviewChannel" NOT NULL DEFAULT 'UNKNOWN',
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "ratingOverall" DECIMAL(3,2),
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "guestName" TEXT NOT NULL,
    "publicText" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReviewCategory" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "category" "public"."ReviewCategoryType" NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "ReviewCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "public"."Listing"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_hostawayListingId_key" ON "public"."Listing"("hostawayListingId");

-- CreateIndex
CREATE INDEX "Listing_name_idx" ON "public"."Listing"("name");

-- CreateIndex
CREATE INDEX "Review_listingId_submittedAt_idx" ON "public"."Review"("listingId", "submittedAt");

-- CreateIndex
CREATE INDEX "Review_isApproved_idx" ON "public"."Review"("isApproved");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "public"."Review"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_source_sourceReviewId_key" ON "public"."Review"("source", "sourceReviewId");

-- CreateIndex
CREATE INDEX "ReviewCategory_category_idx" ON "public"."ReviewCategory"("category");

-- CreateIndex
CREATE INDEX "ReviewCategory_reviewId_idx" ON "public"."ReviewCategory"("reviewId");

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReviewCategory" ADD CONSTRAINT "ReviewCategory_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
