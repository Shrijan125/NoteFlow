import { NextApiResponseServerIo } from '@/lib/types';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiRequest } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });

    const users = new Map();

    io.on('connection', (s) => {
      s.on('create-room', (fileId, userid, email) => {
        s.join(fileId);
        users.set(s.id, { userid, email, fileId });

        const collaborators = Array.from(users.values()).filter(user => user.fileId === fileId);
        io.to(fileId).emit('update-collaborators', collaborators);
      });
      s.on('send-changes', (deltas, fileId) => {
        s.to(fileId).emit('receive-changes', deltas, fileId);
      });
      s.on('send-cursor-move', (range, fileId, cursorId) => {
        s.to(fileId).emit('receive-cursor-move', range, fileId, cursorId);
      });

      s.on('leave-room', (fileId) => {
        if (users.has(s.id)) {
          users.delete(s.id);
      
          const collaborators = Array.from(users.values()).filter(user => user.fileId === fileId);
          s.to(fileId).emit('update-collaborators', collaborators);
        }
      });

      s.on('disconnect', () => {
        if (users.has(s.id)) {
          const { fileId } = users.get(s.id);
          users.delete(s.id);
    
          // Send updated user list after removing the disconnected user
          const collaborators = Array.from(users.values()).filter(user => user.fileId === fileId);
          io.to(fileId).emit('update-collaborators', collaborators);
        }
      });

    });


    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
