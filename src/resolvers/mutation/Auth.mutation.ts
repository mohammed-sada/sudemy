import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { User } from 'prisma/prisma-client';

import { Context } from '../..';
import { sendEmail } from '../../utils/sendEmail';

const privateKey = process.env.SECRET_KEY as string;

interface AuthPayload {
  token: string | null;
  userErrors: string[];
}

interface UserPayload {
  user: User | null;
  userErrors: string[];
}

interface UpdateUserInput {
  userId: string;
  input: {
    name: string;
    address: string;
    age: number;
    bio: string;
    role: string;
  };
}

interface RegisterInput {
  input: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    role: string;
    address: string;
    age: number;
    bio: string;
  };
}

interface ResetPasswordInput {
  input: {
    password: string;
    confirmPassword: string;
    token: string;
  };
}

export const authMutaions = {
  async updateAccountInfo(
    _: any,
    { input }: UpdateUserInput,
    { prisma, userInfo }: Context
  ): Promise<UserPayload> {
    const { name, address, age, bio, role } = input;
    if (!name && !address && !age && !bio && !role)
      return {
        user: null,
        userErrors: ['You must specify at least one field to update'],
      };

    const user = await prisma.user.update({
      where: { id: userInfo!.id },
      data: {
        ...input,
      },
    });

    return {
      user,
      userErrors: [],
    };
  },
  async updatePassword(
    _: any,
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
    { prisma, userInfo }: Context
  ): Promise<string> {
    const isValidPassword = validator.isStrongPassword(newPassword, {
      minLength: 6,
      minLowercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    });
    if (!isValidPassword)
      return 'Invalid Password, Please enter a password of min six characters including one symbol and one uppercase letter and one digit';

    const user = await prisma.user.findUnique({ where: { id: userInfo!.id } });
    if (!user) return 'User not found';

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return 'Wrong password';

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userInfo!.id },
      data: {
        password: hashedPassword,
      },
    });

    return 'Password updated successfully';
  },
  async requestResetPassword(
    _: any,
    { email }: { email: string },
    { prisma }: Context
  ) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return 'Email does not exist';

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 1800000; // half an hour from now

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const message = `You are recieving this message because you (or someone else) have requested the reset of a password.\n\n Token: ${resetToken}`;

    // Send email
    await sendEmail({
      email: user.email,
      subject: 'Reset Password Requset',
      message,
    });

    return 'Password reset successfully';
  },
  async resetPassword(
    _: any,
    { input }: ResetPasswordInput,
    { prisma }: Context
  ): Promise<UserPayload> {
    const { password, confirmPassword, token } = input;

    if (password !== confirmPassword)
      return {
        user: null,
        userErrors: ["Passwords don't match"],
      };

    const validPassword = validator.isStrongPassword(password, {
      minLength: 6,
      minSymbols: 1,
      minUppercase: 1,
      minNumbers: 1,
    });
    if (!validPassword)
      return {
        user: null,
        userErrors: [
          'Invalid Password, Please enter a password of min six characters including one symbol and one uppercase letter and one digit',
        ],
      };

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: Date.now(),
        },
      },
    });

    if (!user)
      return {
        user: null,
        userErrors: ['Your password reset token is either invalid or expired.'],
      };

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      user: updatedUser,
      userErrors: [],
    };
  },
  async deleteAccount(
    _: any,
    __: any,
    { prisma, userInfo }: Context
  ): Promise<string> {
    await prisma.course.deleteMany({ where: { publisherId: userInfo!.id } });
    await prisma.user.delete({ where: { id: userInfo!.id } });
    return 'Account deleted successfully';
  },
  async register(
    _: any,
    { input }: RegisterInput,
    { prisma }: Context
  ): Promise<AuthPayload> {
    const { email, name, password, confirmPassword, age, address, bio, role } =
      input;
    try {
      const validEmail = validator.isEmail(email);
      if (!validEmail)
        return {
          token: null,
          userErrors: ['Invalid Email'],
        };
      const existEmail = await prisma.user.findUnique({ where: { email } });
      if (existEmail)
        return {
          token: null,
          userErrors: ['Email already exist'],
        };

      const validPassword = validator.isStrongPassword(password, {
        minLength: 6,
        minSymbols: 1,
        minUppercase: 1,
        minNumbers: 1,
      });
      if (!validPassword)
        return {
          token: null,
          userErrors: [
            'Invalid Password, Please enter a password of min six characters including one symbol and one uppercase letter and one digit',
          ],
        };
      if (password !== confirmPassword)
        return {
          token: null,
          userErrors: ["Passwords don't match"],
        };

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          password: hashedPassword,
          email,
          name,
          age,
          address,
          bio,
          role,
        },
      });

      const token = jwt.sign({ id: user.id }, privateKey, {
        expiresIn: '7d',
      });

      return {
        token,
        userErrors: [],
      };
    } catch (error) {
      console.log(error);
      return {
        token: null,
        userErrors: [],
      };
    }
  },
  async signin(
    _: any,
    args: { email: string; password: string },
    { prisma }: Context
  ): Promise<AuthPayload> {
    const { email, password } = args;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return {
        token: null,
        userErrors: ['Invalid credentials'],
      };

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return {
        token: null,
        userErrors: ['Invalid credentials'],
      };

    const token = await jwt.sign({ id: user.id }, privateKey, {
      expiresIn: '7d',
    });
    return {
      token,
      userErrors: [],
    };
  },
};
