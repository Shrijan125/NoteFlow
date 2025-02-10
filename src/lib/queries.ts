'use server';
import prisma from '@/db';
import { validate } from 'uuid';
import {
  Workspace as workspace,
  Folder,
  File,
  User,
  Workspace,
} from '@prisma/client';

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
      workspaceOwner: userId,
      NOT: {
        collaborator: {
          some: {},
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

  return privateWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];

  const sharedWorkspaces = await prisma.workspace.findMany({
    where: {
      workspaceOwner: userId,
      collaborator: {
        some: {},
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
      return { data: data, error: null };
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
    }),
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
    const response = await prisma.file.update({
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
  folderId: string,
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

export const getUsersFromSearch = async (email: string) => {
  if (!email) return [];
  const account = await prisma.user.findMany({
    where: {
      email: {
        contains: email,
      },
    },
  });
  return account;
};

export const updateWorkspace = async (
  workspace: Partial<Workspace>,
  workspaceId: string,
) => {
  if (!workspaceId) return;
  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: workspace,
    });
    return { data: null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: 'Error' };
  }
};

export const removeCollaborators = async (
  users: { id: string }[],
  workspaceId: string,
) => {
  try {
    for (const user of users) {
      const userExists = await prisma.collaborator.findFirst({
        where: {
          userId: user.id,
          workspaceId: workspaceId,
        },
      });

      if (userExists) {
        await prisma.collaborator.deleteMany({
          where: {
            userId: user.id,
            workspaceId: workspaceId,
          },
        });
      }
    }
  } catch (error) {
    throw new Error('Failed to remove collaborators');
  }
};

export const getCollaborators = async (workspaceId: string) => {
  try {
    const collaborators = await prisma.collaborator.findMany({
      where: {
        workspaceId: workspaceId,
      },
      select: {
        userId: true,
      },
    });

    if (!collaborators.length) return [];

    const userIds = collaborators.map((collaborator) => collaborator.userId);

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
    });

    return users;
  } catch (error) {
    throw new Error('Failed to fetch collaborators');
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaceId) return;
  await prisma.workspace.delete({
    where: {
      id: workspaceId,
    },
  });
};

export const getWorkspaceDetails = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid)
    return {
      data: [],
      error: 'Error',
    };

  try {
    const response = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    return { data: response ? [response] : [], error: null };
  } catch (error) {
    console.log(error);
    return { data: [], error: 'Error' };
  }
};

export const getFileDetails = async (fileId: string) => {
  if (!validate(fileId)) {
    return { data: [], error: 'Error' };
  }

  try {
    const response = await prisma.file.findUnique({
      where: { id: fileId },
    });

    return { data: response ? [response] : [], error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

export const deleteFile = async (fileId: string) => {
  if (!fileId) return;
  await prisma.file.delete({
    where: { id: fileId },
  });
};

export const deleteFolder = async (folderId: string) => {
  if (!folderId) return;
  await prisma.file.delete({
    where: { id: folderId },
  });
};

export const getFolderDetails = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) {
    return { data: [], error: 'Error' };
  }

  try {
    const response = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    return { data: response ? [response] : [], error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

export const findUser = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};
