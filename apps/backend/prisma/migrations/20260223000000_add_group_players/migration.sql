-- CreateTable
CREATE TABLE `GroupPlayer` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GroupPlayer_groupId_idx`(`groupId`),
    INDEX `GroupPlayer_playerId_idx`(`playerId`),
    UNIQUE INDEX `GroupPlayer_groupId_playerId_key`(`groupId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GroupPlayer` ADD CONSTRAINT `GroupPlayer_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupPlayer` ADD CONSTRAINT `GroupPlayer_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: link all active owner players to each existing group
INSERT INTO `GroupPlayer` (`id`, `groupId`, `playerId`, `addedAt`)
SELECT
    CONCAT('seed_', g.id, '_', p.id),
    g.id,
    p.id,
    NOW()
FROM `Group` g
JOIN `Player` p ON p.createdById = g.ownerId AND p.deletedAt IS NULL
WHERE g.deletedAt IS NULL;
