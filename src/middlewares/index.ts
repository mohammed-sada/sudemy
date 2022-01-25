import { checkIfUserExist } from './middlewares';

export const middlewares = {
  Mutation: {
    userUpdate: checkIfUserExist,
    changeRole: checkIfUserExist,
    userDelete: checkIfUserExist,
  },
};
