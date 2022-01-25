import { User } from 'prisma/prisma-client';
import { Context } from '../..';

interface UserPayload {
  user: User | null;
  userErrors: string[];
}

interface UpdateUserInput {
  userId: string;
  input: {
    name: string;
    address: string;
    age: number;
    bio: string;
  };
}
export const adminMutations = {
  async userUpdate(
    _: any,
    { userId, input }: UpdateUserInput,
    { prisma }: Context
  ): Promise<UserPayload> {
    const { name, address, age, bio } = input;
    if (!name && !address && !age && !bio)
      return {
        user: null,
        userErrors: ['You must specify at least one field to update'],
      };

    const user = await prisma.user.update({
      where: { id: +userId },
      data: {
        ...input,
      },
    });

    return {
      user,
      userErrors: [],
    };
  },
  async changeRole(
    _: any,
    { userId, newRole }: { userId: string; newRole: string },
    { prisma }: Context
  ): Promise<UserPayload> {
    const user = await prisma.user.update({
      where: { id: +userId },
      data: { role: newRole },
    });

    return {
      user,
      userErrors: [],
    };
  },
  async userDelete(
    _: any,
    { userId }: { userId: string },
    { prisma }: Context
  ): Promise<UserPayload> {
    const user = await prisma.user.delete({ where: { id: +userId } });

    return {
      user,
      userErrors: [],
    };
  },
};
