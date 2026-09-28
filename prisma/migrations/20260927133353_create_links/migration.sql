-- CreateTable
CREATE TABLE "links" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdByIp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "links_code_key" ON "links"("code");
