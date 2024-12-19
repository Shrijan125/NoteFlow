'use server';
import { FormSchema } from '../types';
import { z } from 'zod';
import prisma from '@/db';
import bcrypt from 'bcrypt';
import { EmailType, sendEmail } from '../mailer';

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof FormSchema>) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    return { error: { message: 'User already exists' } };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  var newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: { message: error.message } };
    }
    return { error: { message: 'An unknown error occurred' } };
  }
  try {
    await sendEmail({ email, emailType: EmailType.VERIFY, userId: newUser.id });
  } catch (error) {
    if (error instanceof Error) {
      return { error: { message: error.message } };
    }
    return { error: { message: 'An unknown error occurred' } };
  }

  return { data: newUser };
}

export async function actionVerifyUserEmail(email:string) {
  const user= await prisma.user.findFirst({where:{email}});
  if(!user) return {error:{message:'User not found'}};
  if(user.isVerified) return {error:{message:'Email already verified'}};
  try {
    await sendEmail({email,emailType:EmailType.VERIFY,userId:user.id});
  } catch (error) {
    if(error instanceof Error){
      return {error:{message:error.message}};
    }
    return {error:{message:'An unknown error occurred'}};
  }
}