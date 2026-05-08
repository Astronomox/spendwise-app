-- DropIndex
DROP INDEX "Transaction_type_idx";

-- CreateIndex
CREATE INDEX "Transaction_userId_type_idx" ON "Transaction"("userId", "type");
