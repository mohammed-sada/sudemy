import { authMutaions } from './Auth.mutation';
import { courseMutations } from './Course.mutation';
import { reviewMutations } from './Review.mutation';
import { adminMutations } from './Admin.mutation';

export const Mutation = {
  ...authMutaions,
  ...courseMutations,
  ...reviewMutations,
  ...adminMutations,
};
