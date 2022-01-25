import { Review as ReviewType } from 'prisma/prisma-client';
import { Context } from '..';

export const Review = {
  async course(parent: ReviewType, _: any, { prisma }: Context) {
    return await prisma.course.findUnique({ where: { id: parent.courseId } });
  },
  async author(parent: ReviewType, _: any, { prisma }: Context) {
    return await prisma.user.findUnique({ where: { id: parent.publisherId } });
  },
};
