// app/users/actions/index.ts

"use server";

// import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import prisma from "~/modules/db";

// Type Definitions
interface CreateUserInput {
  username: string;
  walletAddress: string;
  authenticated?: boolean;
}

interface UpdateUserInput {
  id: number;
  username?: string;
  walletAddress?: string;
  authenticated?: boolean;
}

// Action: Get All Users
export const getAll = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        ownedInviteCodes: true,
        usedInviteCodes: true,
        referralsGiven: true,
        referralReceived: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Unable to fetch users.");
  }
};

// Action: Get User By ID
export const getById = async (id: number): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedInviteCodes: true,
        usedInviteCodes: true,
        referralsGiven: true,
        referralReceived: true,
      },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw new Error("Unable to fetch user.");
  }
};

// Action: Get User By Username
export const getByUsername = async (username: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        ownedInviteCodes: true,
        usedInviteCodes: true,
        referralsGiven: true,
        referralReceived: true,
      },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user with username "${username}":`, error);
    throw new Error("Unable to fetch user.");
  }
};

// Action: Get User By Wallet Address
export const getByAddress = async (
  walletAddress: string,
): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        ownedInviteCodes: true,
        usedInviteCodes: true,
        referralsGiven: true,
        referralReceived: true,
      },
    });
    return user;
  } catch (error) {
    console.error(
      `Error fetching user with wallet address "${walletAddress}":`,
      error,
    );
    throw new Error("Unable to fetch user.");
  }
};

// Action: Create New User
export const create = async (input: CreateUserInput): Promise<User> => {
  const { username, walletAddress, authenticated = false } = input;
  try {
    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new Error("Username already exists.");
    }

    // Check for existing wallet address
    const existingWallet = await prisma.user.findUnique({
      where: { walletAddress },
    });
    if (existingWallet) {
      throw new Error("Wallet address already in use.");
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        walletAddress,
        authenticated,
      },
    });
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "Unable to create user.");
    } else {
      throw new Error("Unable to create user.");
    }
  }
};

// Action: Update User
export const update = async (input: UpdateUserInput): Promise<User> => {
  const { id, username, walletAddress, authenticated } = input;
  try {
    // Fetch existing user
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new Error("User not found.");
    }

    // If username is being updated, check for uniqueness
    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });
      if (usernameExists) {
        throw new Error("Username already exists.");
      }
    }

    // If walletAddress is being updated, check for uniqueness
    if (walletAddress && walletAddress !== existingUser.walletAddress) {
      const walletExists = await prisma.user.findUnique({
        where: { walletAddress },
      });
      if (walletExists) {
        throw new Error("Wallet address already in use.");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        walletAddress,
        authenticated,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    if (error instanceof Error) {
      throw new Error(error.message || "Unable to update user.");
    } else {
      throw new Error("Unable to update user.");
    }
  }
};

// Action: Delete User
export const remove = async (id: number): Promise<User> => {
  try {
    // Optionally, handle cascading deletes or reassign related records here
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw new Error("Unable to delete user.");
  }
};

// Additional Actions (Optional)

// Action: Authenticate User
export const authenticateUser = async (id: number): Promise<User> => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { authenticated: true },
    });
    return user;
  } catch (error) {
    console.error(`Error authenticating user with ID ${id}:`, error);
    throw new Error("Unable to authenticate user.");
  }
};

// Action: Deauthenticate User
export const deauthenticateUser = async (id: number): Promise<User> => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { authenticated: false },
    });
    return user;
  } catch (error) {
    console.error(`Error deauthenticating user with ID ${id}:`, error);
    throw new Error("Unable to deauthenticate user.");
  }
};
