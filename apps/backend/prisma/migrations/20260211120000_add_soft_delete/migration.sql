-- AlterTable
ALTER TABLE `Player` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Game` ADD COLUMN `deletedAt` DATETIME(3) NULL;
