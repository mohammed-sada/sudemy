import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    getMe: User
    users: [User]!
    user(userId: ID!): User
    courses: [Course!]
    course(courseId: ID!): Course
    courseReviews(courseId: ID!): [Review!]
    review(reviewId: ID!): Review
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    signin(email: String!, password: String!): AuthPayload!

    updateAccountInfo(input: UpdateUserInput!): UserPayload!
    updatePassword(oldPassword: String!, newPassword: String!): String!
    requestResetPassword(email: String!): String!
    resetPassword(input: ResetPasswordInput!): UserPayload!
    deleteAccount: String!

    courseCreate(input: CourseInput!): CoursePayload!
    courseUpdate(courseId: ID!, input: CourseInput!): CoursePayload!
    coursePublish(courseId: ID!): CoursePayload!
    courseUnPublish(courseId: ID!): CoursePayload!
    courseDelete(courseId: ID!): CoursePayload!
    courseSubscribe(courseId: ID!): CoursePayload!
    courseUnSubscribe(courseId: ID!): CoursePayload!

    reviewCreate(courseId: ID!, input: ReviewInput!): ReviewPayload!
    reviewUpdate(reviewId: ID!, input: ReviewInput!): ReviewPayload!
    reviewDelete(reviewId: ID!): ReviewPayload!

    userUpdate(userId: ID!, input: UpdateUserInput!): UserPayload!
    changeRole(userId: ID!, newRole: AdminRole!): UserPayload!
    userDelete(userId: ID!): UserPayload!
  }

  type User {
    id: ID!
    role: String!
    email: String!
    name: String!
    address: String
    age: Int
    bio: String
    courses: [Course!]
    reviews: [Review!]
    createdAt: String!
    updatedAt: String!
  }

  type Course {
    id: ID!
    name: String!
    description: String!
    totalStudents: Int!
    totalReviews: Int!
    published: Boolean!
    publisher: User!
    reviews: [Review!]
    createdAt: String!
    updatedAt: String!
  }

  type Review {
    id: ID!
    rating: Int!
    comment: String
    course: Course!
    author: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String
    userErrors: [String]!
  }
  type UserPayload {
    user: User
    userErrors: [String]!
  }
  type CoursePayload {
    course: Course
    userErrors: [String]!
  }
  type ReviewPayload {
    review: Review
    userErrors: [String]!
  }

  input RegisterInput {
    email: String!
    password: String!
    confirmPassword: String!
    name: String!
    address: String
    bio: String
    age: Int
    role: Role
  }

  input UpdateUserInput {
    name: String
    address: String
    bio: String
    age: Int
    role: Role
  }

  input ResetPasswordInput {
    password: String!
    confirmPassword: String!
    token: String!
  }

  input CourseInput {
    name: String
    description: String
  }

  input ReviewInput {
    rating: Int
    comment: String
  }

  enum Role {
    student
    publisher
  }

  enum AdminRole {
    student
    publisher
    admin
  }
`;
