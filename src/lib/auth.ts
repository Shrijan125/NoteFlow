import prisma from '@/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { EMAIL_NOT_VERIFIED } from './constants';
import { NextAuthOptions } from 'next-auth';

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

          // Return only the fields you want to expose to the session
          return {
            id: user.id,
            email: user.email,
          };
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
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        id: token.sub,
        email: token.email,
      }
    })
  }
} satisfies NextAuthOptions;