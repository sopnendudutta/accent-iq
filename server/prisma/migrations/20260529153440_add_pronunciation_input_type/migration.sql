/*
  Warnings:

  - You are about to drop the column `history` on the `PronunciationHistory` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PronunciationInputType" AS ENUM ('TEXT', 'VOICE');

-- AlterTable
ALTER TABLE "PronunciationHistory" DROP COLUMN "history",
ADD COLUMN     "inputType" "PronunciationInputType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "result" JSONB;
