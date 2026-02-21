-- CreateTable: Group
CREATE TABLE `Group` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `ownerId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `Group_slug_key` ON `Group`(`slug`);
CREATE INDEX `Group_ownerId_idx` ON `Group`(`ownerId`);

-- CreateTable: GroupMember
CREATE TABLE `GroupMember` (
  `id` VARCHAR(191) NOT NULL,
  `groupId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `GroupMember_groupId_userId_key` ON `GroupMember`(`groupId`, `userId`);
CREATE INDEX `GroupMember_groupId_idx` ON `GroupMember`(`groupId`);
CREATE INDEX `GroupMember_userId_idx` ON `GroupMember`(`userId`);

-- CreateTable: GroupJoinRequest
CREATE TABLE `GroupJoinRequest` (
  `id` VARCHAR(191) NOT NULL,
  `groupId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `status` ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `GroupJoinRequest_groupId_userId_key` ON `GroupJoinRequest`(`groupId`, `userId`);
CREATE INDEX `GroupJoinRequest_groupId_idx` ON `GroupJoinRequest`(`groupId`);
CREATE INDEX `GroupJoinRequest_userId_idx` ON `GroupJoinRequest`(`userId`);

-- CreateTable: GroupInvitation
CREATE TABLE `GroupInvitation` (
  `id` VARCHAR(191) NOT NULL,
  `groupId` VARCHAR(191) NOT NULL,
  `invitedUserId` VARCHAR(191) NOT NULL,
  `invitedByUserId` VARCHAR(191) NOT NULL,
  `status` ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `GroupInvitation_groupId_invitedUserId_key` ON `GroupInvitation`(`groupId`, `invitedUserId`);
CREATE INDEX `GroupInvitation_groupId_idx` ON `GroupInvitation`(`groupId`);
CREATE INDEX `GroupInvitation_invitedUserId_idx` ON `GroupInvitation`(`invitedUserId`);

-- CreateTable: Notification
CREATE TABLE `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('GROUP_JOIN_REQUEST','GROUP_INVITATION') NOT NULL,
  `toUserId` VARCHAR(191) NOT NULL,
  `fromUserId` VARCHAR(191) NOT NULL,
  `groupId` VARCHAR(191) NULL,
  `relatedId` VARCHAR(191) NULL,
  `message` VARCHAR(191) NOT NULL,
  `read` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Notification_toUserId_idx` ON `Notification`(`toUserId`);
CREATE INDEX `Notification_fromUserId_idx` ON `Notification`(`fromUserId`);

-- AddForeignKey: Group
ALTER TABLE `Group` ADD CONSTRAINT `Group_ownerId_fkey`
  FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: GroupMember
ALTER TABLE `GroupMember` ADD CONSTRAINT `GroupMember_groupId_fkey`
  FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `GroupMember` ADD CONSTRAINT `GroupMember_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: GroupJoinRequest
ALTER TABLE `GroupJoinRequest` ADD CONSTRAINT `GroupJoinRequest_groupId_fkey`
  FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `GroupJoinRequest` ADD CONSTRAINT `GroupJoinRequest_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: GroupInvitation
ALTER TABLE `GroupInvitation` ADD CONSTRAINT `GroupInvitation_groupId_fkey`
  FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `GroupInvitation` ADD CONSTRAINT `GroupInvitation_invitedUserId_fkey`
  FOREIGN KEY (`invitedUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `GroupInvitation` ADD CONSTRAINT `GroupInvitation_invitedByUserId_fkey`
  FOREIGN KEY (`invitedByUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Notification
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_toUserId_fkey`
  FOREIGN KEY (`toUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification` ADD CONSTRAINT `Notification_fromUserId_fkey`
  FOREIGN KEY (`fromUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification` ADD CONSTRAINT `Notification_groupId_fkey`
  FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
