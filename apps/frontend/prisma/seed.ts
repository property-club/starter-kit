// prisma/seed.ts

import { PrismaClient, User, InviteCode, Referral } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Logs messages with a standardized format.
 * @param message - The message to log.
 */
function logStep(message: string): void {
  console.log(`\n===== ${message} =====\n`);
}

/**
 * Creates a new user in the database.
 * @param username - The username of the new user.
 * @param walletAddress - The wallet address of the new user.
 * @param authenticated - Authentication status of the user.
 * @returns The created user.
 */
async function createUser(
  username: string,
  walletAddress: string,
  authenticated: boolean,
): Promise<User> {
  const user = await prisma.user.create({
    data: {
      username,
      walletAddress,
      authenticated,
    },
  });
  console.log(`User created: ${username} (ID: ${user.id})`);
  return user;
}

/**
 * Generates a specified number of invite codes for a user.
 * @param ownerUserId - The ID of the user owning the invite codes.
 * @param numberOfCodes - The number of invite codes to generate.
 * @returns An array of created invite codes.
 */
async function generateInviteCodes(
  ownerUserId: number,
  numberOfCodes: number,
): Promise<InviteCode[]> {
  const inviteCodes: InviteCode[] = [];

  for (let i = 1; i <= numberOfCodes; i++) {
    const code = `INVITE-${ownerUserId}-${Date.now()}-${i}`;
    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        ownerUserId,
        isUsed: false,
      },
    });
    inviteCodes.push(inviteCode);
  }

  console.log(
    `${numberOfCodes} invite codes generated for User ID: ${ownerUserId}`,
  );
  return inviteCodes;
}

/**
 * Invites a new user using an existing invite code.
 * @param referrerUser - The user who is inviting.
 * @param inviteCode - The invite code being used.
 * @param newUsername - The username of the new user.
 * @param newWalletAddress - The wallet address of the new user.
 * @param authenticated - Authentication status of the new user.
 * @returns The newly invited user.
 */
async function inviteUser(
  referrerUser: User,
  inviteCode: InviteCode,
  newUsername: string,
  newWalletAddress: string,
  authenticated: boolean = false,
): Promise<User> {
  // Create the new user
  const newUser = await createUser(
    newUsername,
    newWalletAddress,
    authenticated,
  );

  // Update the invite code to mark it as used
  const updatedInviteCode = await prisma.inviteCode.update({
    where: { code: inviteCode.code },
    data: {
      isUsed: true,
      usedByUserId: newUser.id,
    },
  });
  console.log(
    `Invite Code ${updatedInviteCode.code} used by ${newUsername} (ID: ${newUser.id})`,
  );

  // Create a referral record
  const referral = await prisma.referral.create({
    data: {
      referrerUserId: referrerUser.id,
      referredUserId: newUser.id,
    },
  });
  console.log(
    `Referral created: ${referrerUser.username} invited ${newUsername}`,
  );

  return newUser;
}

/**
 * Seeds the database with users, invite codes, and referrals as per the defined scenario.
 */
async function main() {
  logStep("Starting the seeding process");

  try {
    // Step 0: Delete all existing data
    logStep("Deleting all existing data");
    await prisma.referral.deleteMany();
    await prisma.inviteCode.deleteMany();
    await prisma.user.deleteMany();

    // Step 1: Create the Root User
    logStep("Creating the Root User");
    const rootUser = await createUser(
      "rootUser",
      "0xRootUserWalletAddress",
      true,
    );

    // Step 2: Generate 8 Invite Codes for Root User
    logStep("Generating Invite Codes for Root User");
    const rootInviteCodes = await generateInviteCodes(rootUser.id, 8);

    // Step 3: Root User Invites 4 Users
    logStep("Root User Inviting 4 Users");
    const invitedUsers: User[] = [];

    for (let i = 1; i <= 4; i++) {
      const inviteCode = rootInviteCodes.pop();
      if (!inviteCode) {
        console.error("No available invite codes for Root User");
        break;
      }

      const newUsername = `user${i}`;
      const newWalletAddress = `0xUser${i}WalletAddress`;
      const invitedUser = await inviteUser(
        rootUser,
        inviteCode,
        newUsername,
        newWalletAddress,
        true,
      );
      invitedUsers.push(invitedUser);
    }

    // Step 4: Generate 8 Invite Codes for Each Invited User
    logStep("Generating Invite Codes for Invited Users");
    for (const user of invitedUsers) {
      await generateInviteCodes(user.id, 8);
    }

    // Step 5: One of the Invited Users Invites 3 More Users
    logStep("Invited User 1 Inviting 3 More Users");
    const user1 = invitedUsers[0]; // Assuming the first invited user is User 1

    if (!user1) {
      throw new Error("user1 is undefined");
    }

    // Fetch available invite codes for User 1
    const user1InviteCodes = await prisma.inviteCode.findMany({
      where: {
        ownerUserId: user1.id,
        isUsed: false,
      },
      take: 3, // We need only 3 invite codes
    });

    if (user1InviteCodes.length < 3) {
      console.error("Not enough invite codes available for User 1");
    } else {
      const secondaryInvitedUsers: User[] = [];
      for (let i = 1; i <= 3; i++) {
        const inviteCode = user1InviteCodes[i - 1];
        const newUsername = `user1a${i}`; // e.g., user1a1, user1a2, user1a3
        const newWalletAddress = `0xUser1a${i}WalletAddress`;
        const invitedUser = await inviteUser(
          user1,
          inviteCode!,
          newUsername,
          newWalletAddress,
          false,
        );
        secondaryInvitedUsers.push(invitedUser);
      }

      // Generate 8 Invite Codes for Each Secondary Invited User
      logStep("Generating Invite Codes for Secondary Invited Users");
      for (const user of secondaryInvitedUsers) {
        await generateInviteCodes(user.id, 8);
      }
    }

    logStep("Seeding completed successfully");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error; // Re-throw to ensure the outer catch handles it
  }
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  });
