import jwt from 'jsonwebtoken';

export async function getUserFromToken(token: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SECRET_KEY as string) as {
      id: number;
    };
  } catch (error) {
    return null;
  }
}
