// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting the seeding process...");

  try {
    // Clear existing data (optional)
    console.log("Clearing existing referrals...");
    await prisma.referral.deleteMany();
    console.log("Referrals cleared.");

    console.log("Clearing existing invite codes...");
    await prisma.inviteCode.deleteMany();
    console.log("Invite Codes cleared.");

    console.log("Clearing existing users...");
    await prisma.user.deleteMany();
    console.log("Users cleared.");

    // Create Users
    console.log("Creating users...");
    const usersData = [
      {
        username: "alice",
        walletAddress: "0xAliceWalletAddress",
        authenticated: true,
      },
      {
        username: "bob",
        walletAddress: "0xBobWalletAddress",
        authenticated: true,
      },
      {
        username: "charlie",
        walletAddress: "0xCharlieWalletAddress",
        authenticated: false,
      },
      {
        username: "diana",
        walletAddress: "0xDianaWalletAddress",
        authenticated: false,
      },
    ];

    const createdUsers = await Promise.all(
      usersData.map((user) =>
        prisma.user.create({
          data: user,
        }),
      ),
    );
    console.log("Users created:", createdUsers);

    // Helper function to find user by username
    const findUserId = (username: string): number => {
      const user = createdUsers.find((u) => u.username === username);
      if (!user) {
        throw new Error(`User with username "${username}" not found.`);
      }
      return user.id;
    };

    // Create Invite Codes
    console.log("Creating invite codes...");
    const inviteCodesData = [
      { code: "INVITEALICE1", ownerUsername: "alice" },
      { code: "INVITEALICE2", ownerUsername: "alice" },
      { code: "INVITEBOB1", ownerUsername: "bob" },
    ];

    const createdInviteCodes = await Promise.all(
      inviteCodesData.map((code) =>
        prisma.inviteCode.create({
          data: {
            code: code.code,
            ownerUserId: findUserId(code.ownerUsername),
            isUsed: false,
            usedByUserId: null,
          },
        }),
      ),
    );
    console.log("Invite Codes created:", createdInviteCodes);

    // Use an Invite Code
    console.log("Using an invite code...");
    const inviteCodeUsed = await prisma.inviteCode.update({
      where: { code: "INVITEALICE1" },
      data: {
        isUsed: true,
        usedByUserId: findUserId("charlie"),
      },
    });
    console.log("Invite Code used:", inviteCodeUsed);

    // Create Referrals
    console.log("Creating referrals...");
    const referralsData = [
      { referrerUsername: "alice", referredUsername: "bob" },
      { referrerUsername: "alice", referredUsername: "charlie" },
      { referrerUsername: "bob", referredUsername: "diana" },
    ];

    const createdReferrals = await Promise.all(
      referralsData.map((referral) =>
        prisma.referral.create({
          data: {
            referrerUserId: findUserId(referral.referrerUsername),
            referredUserId: findUserId(referral.referredUsername),
          },
        }),
      ),
    );
    console.log("Referrals created:", createdReferrals);

    console.log("Seeding completed successfully.");
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
