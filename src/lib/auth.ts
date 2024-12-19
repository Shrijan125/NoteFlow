import prisma from '@/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { EMAIL_NOT_VERIFIED } from './constants';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Email' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Password',
        },
      },
      async authorize(
        credentials: { email: string; password: string } | undefined,
      ) {
        if (!credentials) return null;

        try {
          const user = await prisma.user.findFirst({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error('Invalid Credentials');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            throw new Error('Invalid Credentials');
          }

          if (!user.isVerified) {
            throw new Error(EMAIL_NOT_VERIFIED);
          }

          return user;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          } else throw new Error('An unknown error occurred');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};
