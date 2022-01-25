import { User as UserType } from 'prisma/prisma-client';
import { Context } from '..';

export const User = {
  async courses(parent: UserType, _: any, { prisma }: Context) {
    return await prisma.course.findMany({
      where: { publisherId: parent.id },
    });
  },
  async reviews(parent: UserType, _: any, { prisma }: Context) {
    return await prisma.review.findMany({
      where: { publisherId: parent.id },
    });
  },
};
