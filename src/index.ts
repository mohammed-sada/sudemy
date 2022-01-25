import { ApolloServer } from 'apollo-server';
import { PrismaClient, Prisma } from 'prisma/prisma-client';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { middlewares } from './middlewares';
import { permissions } from './permissions';
import { getUserFromToken } from './utils/getUserFromToken';

export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  userInfo: {
    id: number;
  } | null;
}
const prisma = new PrismaClient();

let schema = makeExecutableSchema({ typeDefs, resolvers });
schema = applyMiddleware(schema, permissions, middlewares);

const server = new ApolloServer({
  schema,
  context: async ({ req }: any): Promise<Context> => {
    const userInfo = await getUserFromToken(req.headers.authorization);
    return {
      prisma,
      userInfo,
    };
  },
});

server
  .listen()
  .then(({ url }) => console.log(`server is up and running on: ${url} 👷🪓`))
  .catch((error) => console.log(error));
