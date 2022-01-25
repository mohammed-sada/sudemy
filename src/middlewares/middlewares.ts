import { Context } from '..';

export async function checkIfUserExist(
  resolve: any,
  parent: any,
  args: { userId: string },
  context: Context
) {
  const userExist = await context.prisma.user.findUnique({
    where: { id: +args.userId },
  });
  if (!userExist)
    return {
      user: null,
      userErrors: ['User not found'],
    };

  return resolve(parent, args, context);
}
