import { Course as CourseType } from 'prisma/prisma-client';
import { Context } from '..';

export const Course = {
  async publisher(parent: CourseType, _: any, { prisma }: Context) {
    return await prisma.user.findUnique({
      where: {
        id: parent.publisherId,
      },
      select: {
        name: true,
        bio: true,
        courses: true,
        role: true,
      },
    });
  },
  async reviews(parent: CourseType, _: any, { prisma }: Context) {
    return await prisma.review.findMany({ where: { courseId: parent.id } });
  },
};
