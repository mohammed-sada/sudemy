import { Review } from 'prisma/prisma-client';
import { Context } from '../..';

interface ReviewPayload {
  review: Review | null;
  userErrors: string[];
}

interface ReviewInput {
  rating: number;
  comment: string;
}

export const reviewMutations = {
  async reviewCreate(
    _: any,
    { courseId, input }: { courseId: string; input: ReviewInput },
    { prisma, userInfo }: Context
  ): Promise<ReviewPayload> {
    const { rating, comment } = input;
    if (!rating)
      return {
        review: null,
        userErrors: ['You must provide a rating for the review'],
      };

    if (rating > 10 || rating < 1)
      return {
        review: null,
        userErrors: ['Rating must be between 1-10'],
      };

    // Check if this user has previously added a review to this same course or not, because we will prevent users from adding more than one review to the same course
    const reviewExist = await prisma.course.findFirst({
      where: {
        id: +courseId,
        reviews: {
          some: {
            publisherId: userInfo!.id,
          },
        },
      },
    });
    if (reviewExist) {
      return {
        review: null,
        userErrors: [
          'You are not allowed to create more than one review for the same course',
        ],
      };
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        publisherId: userInfo!.id,
        courseId: +courseId,
      },
    });

    // Update the averageReviews when we add a new review to the course
    const aggregations = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });
    const averageReviews = (aggregations && aggregations._avg.rating) || 0;
    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        totalReviews: { decrement: 1 },
        averageReviews,
      },
    });

    return {
      review,
      userErrors: [],
    };
  },
  async reviewUpdate(
    _: any,
    { reviewId, input }: { reviewId: string; input: ReviewInput },
    { prisma }: Context
  ): Promise<ReviewPayload> {
    const { rating, comment } = input;

    if (!rating && !comment)
      return {
        review: null,
        userErrors: ['You must specify at least one field to update'],
      };

    const review = await prisma.review.update({
      where: { id: +reviewId },
      data: {
        rating,
        comment,
      },
    });

    if (rating) {
      // Update the averageReviews when we add a new review to the course
      const aggregations = await prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      });
      const averageReviews = (aggregations && aggregations._avg.rating) || 0;
      await prisma.course.update({
        where: { id: review.courseId },
        data: {
          totalReviews: { decrement: 1 },
          averageReviews,
        },
      });
    }

    return {
      review,
      userErrors: [],
    };
  },
  async reviewDelete(
    _: any,
    { reviewId }: { reviewId: string },
    { prisma }: Context
  ): Promise<ReviewPayload> {
    const review = await prisma.review.delete({ where: { id: +reviewId } });

    // Update the averageReviews when we add a new review to the course
    const aggregations = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });
    const averageReviews = (aggregations && aggregations._avg.rating) || 0;
    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        totalReviews: { decrement: 1 },
        averageReviews,
      },
    });

    return {
      review,
      userErrors: [],
    };
  },
};
