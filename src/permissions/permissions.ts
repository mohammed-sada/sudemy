import { rule } from 'graphql-shield';
import { Context } from '..';

export const isAuthenticated = rule()(
  async (_: any, __: any, { userInfo }: Context) => {
    if (userInfo) return true;

    return new Error('You are not authenticated');
  }
);

export const isAdmin = rule()(
  async (_: any, __: any, { prisma, userInfo }: Context) => {
    const user = await prisma.user.findUnique({ where: { id: userInfo?.id } });

    if (!user) return new Error('User not found');

    if (user.role === 'admin') return true;

    return new Error('Not authorized');
  }
);
export const isPublisher = rule()(
  async (_: any, __: any, { prisma, userInfo }: Context) => {
    const user = await prisma.user.findUnique({ where: { id: userInfo?.id } });

    if (!user) return new Error('User not found');

    if (user.role === 'publisher') return true;

    return new Error('Not authorized');
  }
);
export const isStudent = rule()(
  async (_: any, __: any, { prisma, userInfo }: Context) => {
    const user = await prisma.user.findUnique({ where: { id: userInfo?.id } });

    if (!user) return new Error('User not found');

    if (user.role === 'student') return true;

    return new Error('Not authorized');
  }
);

export const isCourseOwner = rule()(
  async (_: any, { courseId }, { prisma, userInfo }: Context) => {
    const user = await prisma.user.findUnique({ where: { id: userInfo!.id } });

    const course = await prisma.course.findUnique({ where: { id: +courseId } });

    if (!user || !course) return new Error('User or Course not found');

    // Check if owner or admin
    if (userInfo!.id !== course.publisherId && user.role !== 'admin')
      return new Error('You are not allowed to mutate this course');

    return true;
  }
);
export const isReviewOwner = rule()(
  async (_: any, { reviewId }, { prisma, userInfo }: Context) => {
    const user = await prisma.user.findUnique({ where: { id: userInfo!.id } });

    const review = await prisma.review.findUnique({ where: { id: +reviewId } });

    if (!user || !review) return new Error('User or Review not found');

    if (userInfo!.id !== review.publisherId && user.role !== 'admin')
      return new Error('You are not allowed to mutate this review');

    return true;
  }
);
