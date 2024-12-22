import { useEffect } from 'react';
import { useAppState } from '../providers/state-provider';
import { useRouter } from 'next/navigation';
import { File } from '@prisma/client';

const useRealtimeFiles = () => {
  const { dispatch, state } = useAppState();
  const router = useRouter();
  
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      if (payload.eventType === 'INSERT') {
        const {
          folder_id: folderId,
          workspace_id: workspaceId,
          id: fileId,
        } = payload.new;
        
        if (
          !state.workspaces
            .find((workspace) => workspace.id === workspaceId)
            ?.folders.find((folder) => folder.id === folderId)
            ?.files.find((file) => file.id === fileId)
        ) {
          const newFile: File = {
            id: payload.new.id,
            workspaceId: payload.new.workspace_id,
            folderId: payload.new.folder_id,
            createdAt: new Date(payload.new.created_at),
            title: payload.new.title,
            iconId: payload.new.icon_id,
            data: payload.new.data,
            inTrash: payload.new.in_trash,
            bannerUrl: payload.new.banner_url,
          };
          
          dispatch({
            type: 'ADD_FILE',
            payload: { file: newFile, folderId, workspaceId },
          });
        }
      } else if (payload.eventType === 'DELETE') {
        let workspaceId = '';
        let folderId = '';
        
        const fileExists = state.workspaces.some((workspace) =>
          workspace.folders.some((folder) =>
            folder.files.some((file) => {
              if (file.id === payload.old.id) {
                workspaceId = workspace.id;
                folderId = folder.id;
                return true;
              }
            })
          )
        );
        
        if (fileExists && workspaceId && folderId) {
          router.replace(`/dashboard/${workspaceId}`);
          dispatch({
            type: 'DELETE_FILE',
            payload: { fileId: payload.old.id, folderId, workspaceId },
          });
        }
      } else if (payload.eventType === 'UPDATE') {
        const { folder_id: folderId, workspace_id: workspaceId } = payload.new;
        
        state.workspaces.some((workspace) =>
          workspace.folders.some((folder) =>
            folder.files.some((file) => {
              if (file.id === payload.new.id) {
                dispatch({
                  type: 'UPDATE_FILE',
                  payload: {
                    workspaceId,
                    folderId,
                    fileId: payload.new.id,
                    file: {
                      title: payload.new.title,
                      iconId: payload.new.icon_id,
                      inTrash: payload.new.in_trash,
                    },
                  },
                });
                return true;
              }
            })
          )
        );
      }
    };

    return () => {
      ws.close();
    };
  }, [state]);

  return null;
};

export default useRealtimeFiles;