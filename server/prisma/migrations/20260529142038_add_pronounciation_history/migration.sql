-- CreateEnum
CREATE TYPE "Accent" AS ENUM ('US', 'UK', 'AUSTRALIAN', 'INDIAN');

-- CreateTable
CREATE TABLE "PronunciationHistory" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "accent" "Accent" NOT NULL,
    "phonetic" TEXT,
    "syllables" JSONB,
    "tips" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PronunciationHistory" ADD CONSTRAINT "PronunciationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
