-- CreateTable
CREATE TABLE "block_tasks" (
    "block_number" BIGINT NOT NULL,
    "block_hash" VARCHAR(255),
    "evm_block_hash" VARCHAR(255),
    "status" VARCHAR(255),

    CONSTRAINT "block_tasks_pkey" PRIMARY KEY ("block_number")
);
