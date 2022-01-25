import { and, or, shield } from 'graphql-shield';
import {
  isAuthenticated,
  isAdmin,
  isPublisher,
  isCourseOwner,
  isStudent,
  isReviewOwner,
} from './permissions';

export const permissions = shield({
  Query: {
    getMe: isAuthenticated,
    users: and(isAuthenticated, isAdmin),
    user: and(isAuthenticated, isAdmin),
  },
  Mutation: {
    courseCreate: and(isAuthenticated, or(isAdmin, isPublisher)),
    courseUpdate: and(isAuthenticated, isCourseOwner),
    courseDelete: and(isAuthenticated, isCourseOwner),
    coursePublish: and(isAuthenticated, isCourseOwner),
    courseUnPublish: and(isAuthenticated, isCourseOwner),
    courseSubscribe: and(isAuthenticated, or(isAdmin, isStudent)),
    courseUnSubscribe: and(isAuthenticated, or(isAdmin, isStudent)),

    updateAccountInfo: isAuthenticated,
    updatePassword: isAuthenticated,
    deleteAccount: isAuthenticated,

    reviewCreate: and(isAuthenticated, or(isAdmin, isStudent)),
    reviewUpdate: and(isAuthenticated, isReviewOwner),
    reviewDelete: and(isAuthenticated, isReviewOwner),

    userUpdate: and(isAuthenticated, isAdmin),
    changeRole: and(isAuthenticated, isAdmin),
    userDelete: and(isAuthenticated, isAdmin),
  },
});
