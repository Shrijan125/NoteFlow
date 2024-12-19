'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from '@/lib/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../../../public/noteflowlogo.svg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/global/Loader';
import { signIn } from 'next-auth/react';
import { actionVerifyUserEmail } from '@/lib/server-actions/auth-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck } from 'lucide-react';
import { EMAIL_NOT_VERIFIED } from '@/lib/constants';

const LoginPage = () => {
  const router = useRouter();
  const [verified , setVerified] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const isLoading = form.formState.isSubmitting;
  const [loading , setLoading] = useState(false);
  async function handleClick(e: React.MouseEvent<HTMLButtonElement>)
  {
    setLoading(true);
    e.preventDefault();
    const result = await actionVerifyUserEmail(form.getValues('email'));
    if(result?.error)
    {
      setSubmitError(result.error.message);
      form.reset();
      setLoading(false);
      return;
    }
    setLoading(false);
    setSubmitted(true);
  }

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData,
  ) => {
    const { email, password } = formData;
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (result?.error === EMAIL_NOT_VERIFIED) {
      setSubmitError(EMAIL_NOT_VERIFIED);
      setVerified(true);
      return;
    }
    if (result?.error) {
      form.reset();
      setSubmitError(result.error);
      return;
    }
    router.replace('/dashboard');
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError('');
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link
          href="/"
          className="
          w-full
          flex
          justify-left
          items-center"
        >
          <Image src={Logo} alt="noteflow Logo" width={50} height={50} />
          <span
            className="font-semibold
          dark:text-white text-4xl first-letter:ml-2"
          >
            NoteFlow
          </span>
        </Link>
        <FormDescription
          className="
        text-foreground/60"
        >
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>
        {!submitted &&  <FormField
          disabled={isLoading || loading}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />}
        {!submitted &&  <FormField
          disabled={isLoading || loading}
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />}
        {!submitted && submitError && <FormMessage>{submitError}</FormMessage>}
       {!submitted && <Button
          type="submit"
          className="w-full p-6"
          size="lg"
          disabled={isLoading || loading}
        >
          {!isLoading ? 'Login' : <Loader />}
        </Button>}
        {!submitted && (verified ?
         <span className="self-container">
          Email not verified?{' '}
         <Button onClick={handleClick} disabled={loading}  variant={'ghost'} className='text-primary text-md'>
            {!loading ? 'Verify Your Email' : <Loader/>}
         </Button>
       </span>
         : <span className="self-container">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary">
            Sign Up
          </Link>
        </span>)}
       {!submitted && !loading && <span className="self-container flex flex-col">
          <Link href="/reset"  className="text-primary">
            Forgot Password ?
          </Link>
        </span>}
      {
        submitted &&  (<Alert className='bg-primary'>
          <MailCheck className="h-4 w-4" />
        <AlertTitle>
          Check your email
        </AlertTitle>
        <AlertDescription>
          {'An email confirmation has been sent.'}
        </AlertDescription>
      </Alert>)
      }
      </form>
    </Form>
  );
};

export default LoginPage;
