import { Course } from 'prisma/prisma-client';
import { Context } from '../..';

interface CoursePayload {
  course: Course | null;
  userErrors: string[];
}
interface CourseInput {
  input: {
    name: string;
    description: string;
  };
}

export const courseMutations = {
  async courseCreate(
    _: any,
    { input }: CourseInput,
    { prisma, userInfo }: Context
  ): Promise<CoursePayload> {
    const { name, description } = input;
    if (!name || !description)
      return {
        course: null,
        userErrors: ['Empty fields are not allowed'],
      };

    const course = await prisma.course.create({
      data: { name, description, publisherId: userInfo!.id },
    });

    return {
      course,
      userErrors: [],
    };
  },
  async courseUpdate(
    _: any,
    { courseId, input }: { courseId: string; input: CourseInput['input'] },
    { prisma }: Context
  ): Promise<CoursePayload> {
    const { name, description } = input;
    if (!name && !description)
      return {
        course: null,
        userErrors: ['You must specify at least one field to update'],
      };

    const course = await prisma.course.update({
      where: { id: +courseId },
      data: {
        name,
        description,
      },
    });

    return {
      course,
      userErrors: [],
    };
  },
  async courseDelete(
    _: any,
    { courseId }: { courseId: string },
    { prisma }: Context
  ): Promise<CoursePayload> {
    await prisma.review.deleteMany({ where: { courseId: +courseId } });
    const course = await prisma.course.delete({ where: { id: +courseId } });

    return {
      course,
      userErrors: [],
    };
  },
  async coursePublish(
    _: any,
    { courseId }: { courseId: string },
    { prisma }: Context
  ): Promise<CoursePayload> {
    const course = await prisma.course.update({
      where: { id: +courseId },
      data: { published: true },
    });

    return {
      course,
      userErrors: [],
    };
  },
  async courseUnPublish(
    _: any,
    { courseId }: { courseId: string },
    { prisma }: Context
  ): Promise<CoursePayload> {
    const course = await prisma.course.update({
      where: { id: +courseId },
      data: { published: false },
    });

    return {
      course,
      userErrors: [],
    };
  },
  async courseSubscribe(
    _: any,
    { courseId }: { courseId: string },
    { prisma, userInfo }: Context
  ): Promise<CoursePayload> {
    const course = await prisma.course.update({
      where: { id: +courseId },
      data: {
        subscribedStudents: {
          create: {
            user: {
              connect: {
                id: userInfo!.id,
              },
            },
          },
        },
      },
    });
    return {
      course,
      userErrors: [],
    };
  },
  async courseUnSubscribe(
    _: any,
    { courseId }: { courseId: string },
    { prisma, userInfo }: Context
  ) {
    const course = await prisma.course.update({
      where: { id: +courseId },
      data: {
        subscribedStudents: {
          delete: {
            userId_courseId: {
              courseId: +courseId,
              userId: userInfo!.id,
            },
          },
        },
      },
    });
    return {
      course,
      userErrors: [],
    };
  },
};
