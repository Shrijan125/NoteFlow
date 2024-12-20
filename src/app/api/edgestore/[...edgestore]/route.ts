import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

const edgestoreRouter = es.router({
  myPublicImages: es
    .imageBucket()
    .beforeUpload(({ ctx, input, fileInfo }) => {
      console.log('beforeUpload', ctx, input, fileInfo);
      return true;
    })
    .beforeDelete(({ ctx, fileInfo }) => {
      console.log('beforeDelete', ctx, fileInfo);
      return true;
    }),
});

const handler = createEdgeStoreNextHandler({ router: edgestoreRouter });

export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgestoreRouter;
