-- AddColumn: groupId to Game
ALTER TABLE `Game` ADD COLUMN `groupId` VARCHAR(191) NULL;

CREATE INDEX `Game_groupId_idx` ON `Game`(`groupId`);

ALTER TABLE `Game` ADD CONSTRAINT `Game_groupId_fkey`
    FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
