import WebSocket from 'ws';

export function setupWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocket.Server({ server: httpServer });

  // Rest of your code remains the same
  // @ts-ignore - accessing internal client
  const client = prisma._engine.client;

  client.query('LISTEN file_changes');

  client.on('notification', (msg) => {
    const payload = JSON.parse(msg.payload);
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(payload));
    });
  });

  return wss;
}
