-- CreateTable
CREATE TABLE "PronunciationFavorite" (
    "id" TEXT NOT NULL,
    "inputType" "PronunciationInputType" NOT NULL DEFAULT 'TEXT',
    "text" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "accent" "Accent" NOT NULL,
    "phonetic" TEXT,
    "ipa" TEXT,
    "syllables" JSONB,
    "stressPattern" TEXT,
    "mouthTip" TEXT,
    "commonMistake" TEXT,
    "tips" JSONB,
    "exampleSentence" TEXT,
    "result" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PronunciationFavorite_userId_idx" ON "PronunciationFavorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationFavorite_userId_normalizedText_accent_key" ON "PronunciationFavorite"("userId", "normalizedText", "accent");

-- AddForeignKey
ALTER TABLE "PronunciationFavorite" ADD CONSTRAINT "PronunciationFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
