-- CreateTable
CREATE TABLE "MerchantKeyword" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantKeyword_keyword_key" ON "MerchantKeyword"("keyword");

-- AddForeignKey
ALTER TABLE "MerchantKeyword" ADD CONSTRAINT "MerchantKeyword_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
