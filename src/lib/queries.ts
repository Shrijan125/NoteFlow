'use server';
import prisma from '@/db';
import { validate } from 'uuid';
import { Workspace as workspace, Folder, File , User } from '@prisma/client';

export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: 'Error' };
  try {
    const results = await prisma.file.findMany({
      where: {
        folderId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};

export const createWorkspace = async (workspace: workspace) => {
  try {
    const response = await prisma.workspace.create({ data: workspace });
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};

export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return [];

  const collaboratedWorkspaces = await prisma.workspace.findMany({
    where: {
      collaborator: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      workspaceOwner: true,
      title: true,
      iconId: true,
      data: true,
      inTrash: true,
      logo: true,
      bannerUrl: true,
    },
  });
  return collaboratedWorkspaces;
};

export const getFolders = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid)
    return {
      data: null,
      error: 'Error',
    };

  try {
    const results = await prisma.folder.findMany({
      where: { workspaceId },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};

export const getPrivateWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const privateWorkspaces = await prisma.workspace.findMany({
    where: {
      AND: [
        {
          NOT: {
            collaborator: {
              some: {},
            },
          },
        },
        {
          workspaceOwner: userId,
        },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      workspaceOwner: true,
      title: true,
      iconId: true,
      data: true,
      inTrash: true,
      logo: true,
      bannerUrl: true,
    },
  });
  return privateWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];

  const sharedWorkspaces = await prisma.workspace.findMany({
    where: {
      workspaceOwner: userId,
    },
    select: {
      id: true,
      createdAt: true,
      workspaceOwner: true,
      title: true,
      iconId: true,
      data: true,
      inTrash: true,
      logo: true,
      bannerUrl: true,
      collaborator: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return sharedWorkspaces;
};

export const getUserSubscriptionStatus = async (userId: string) => {
    try {
        const data = await prisma.subscription.findFirst({
          where: {
            userId: userId,
          },
        });
      
        if (data) {
          return { data: data , error: null };
        } else {
          return { data: null, error: null };
        }
      } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
      }
  };

export const addCollaborators = async (users: User[], workspaceId: string) => {
  const response = await Promise.all(
    users.map(async (user: User) => {
      const userExists = await prisma.collaborator.findFirst({
        where: {
          userId: user.id,
          workspaceId: workspaceId,
        },
      });
      if (!userExists) {
        await prisma.collaborator.create({
          data: {
            workspaceId: workspaceId,
            userId: user.id,
          },
        });
      }
    })
  );
  };

  export const createFolder = async (folder: Folder) => {
    try {
      const results = await prisma.folder.create({ data: folder });
      return { data: null, error: null };
    } catch (error) {
      console.log(error);
      return { data: null, error: 'Error' };
    }
  };

  export const createFile = async (file: File) => {
    try {
      await prisma.file.create({ data: file });
      return { data: null, error: null };
    } catch (error) {
      console.log(error);
      return { data: null, error: 'Error' };
    }
  };

  export const updateFile = async (file: Partial<File>, fileId: string) => {
    try {
      const response =  await prisma.file.update({
        where: {
          id: fileId,
        },
        data: file,
      });
      return { data: null, error: null };
    } catch (error) {
      console.log(error);
      return { data: null, error: 'Error' };
    }
  };


export const updateFolder = async (
  folder: Partial<Folder>,
  folderId: string
) => {
  try {
    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: folder,
    });
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};