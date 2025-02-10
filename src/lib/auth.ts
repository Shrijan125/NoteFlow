import prisma from '@/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { EMAIL_NOT_VERIFIED } from './constants';
import { NextAuthOptions } from 'next-auth';
import { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

interface CustomUser extends User {
  id: string;
  email: string;
}

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
  };
}

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
        credentials: { email: string; password: string } | undefined
      ): Promise<CustomUser | null> {
        if (!credentials) throw new Error('Please provide your credentials!');

        try {
          const user = await prisma.user.findFirst({
            where: { email: credentials.email },
          });

          if (!user) throw new Error('Invalid Credentials');

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) throw new Error('Invalid Credentials');

          if (!user.isVerified) throw new Error(EMAIL_NOT_VERIFIED);

          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          throw error instanceof Error ? error : new Error('Unable to login!');
        }
      },
    }),
  ],
  callbacks: {
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<CustomSession> {
      return {
        ...session,
        user: {
          id: token.sub as string,
          email: token.email as string,
        },
      };
    },
    async jwt({ token, user }: { token: JWT; user?: User | null }): Promise<JWT> {
      if (user) {
        token.email = user.email ?? '';
      }
      return token;
    }
    
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signin',
  },
} satisfies NextAuthOptions;

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    email?: string;
  }
}
