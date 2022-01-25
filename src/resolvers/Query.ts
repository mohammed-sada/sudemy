import { Context } from '..';

export const Query = {
  // parent, args, context, info
  async getMe(_: any, __: any, { prisma, userInfo }: Context) {
    return await prisma.user.findUnique({ where: { id: userInfo!.id } });
  },
  async users(_: any, __: any, { prisma }: Context) {
    return await prisma.user.findMany({
      take: 10,
      skip: 0,
    });
  },
  async user(_: any, { userId }: { userId: string }, { prisma }: Context) {
    return await prisma.user.findUnique({ where: { id: +userId } });
  },
  async courses(_: any, __: any, { prisma }: Context) {
    return await prisma.course.findMany({
      where: { published: true },
    });
  },
  async course(
    _: any,
    { courseId }: { courseId: string },
    { prisma, userInfo }: Context
  ) {
    if (!userInfo)
      return await prisma.course.findFirst({
        where: { id: +courseId, published: true },
      });

    const user = await prisma.user.findUnique({ where: { id: userInfo.id } });
    if (user?.role === 'admin')
      return await prisma.course.findFirst({
        where: { id: +courseId },
      });

    return await prisma.course.findFirst({
      where: {
        id: +courseId,
        OR: [
          {
            published: true,
          },
          {
            published: false,
            publisherId: userInfo.id,
          },
        ],
      },
    });
  },
  async courseReviews(
    _: any,
    { courseId }: { courseId: string },
    { prisma }: Context
  ) {
    return await prisma.review.findMany({
      where: { courseId: +courseId },
    });
  },
  async review(
    _: any,
    { reviewId }: { reviewId: string },
    { prisma }: Context
  ) {
    return await prisma.review.findUnique({ where: { id: +reviewId } });
  },
};
