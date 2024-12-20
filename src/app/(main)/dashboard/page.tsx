import DashboardSetup from '@/components/dashboard-setup/dashboard-setup';
import prisma from '@/db';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import React from 'react';
import { redirect } from 'next/navigation';

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  const user = await prisma.user.findFirst({
    where: { email: session.user.email || '' },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) return;

  const workspace = await prisma.workspace.findFirst({
    where: { workspaceOwner: user.id },
  });

  if (!workspace)
    return (
      <div
        className="bg-background
        h-screen
        w-screen
        flex
        justify-center
        items-center
  "
      >
        <DashboardSetup
          user={user}
          // subscription={subscription}
        />
      </div>
    );
  redirect(`/dashboard/${workspace.id}`);
};

export default page;
