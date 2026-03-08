const http = require('http');

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:4200',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

const room = {
  id: 1,
  title: 'Demo Planning Board',
  codeRoom: 'demo-room-1234',
  design: '{"version":"6.5.3","objects":[]}'
};

function sendJson(res, status, payload) {
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const url = req.url || '/';

  if (req.method === 'GET' && url === '/api/rooms/user/1') {
    return sendJson(res, 200, [room]);
  }

  if (req.method === 'GET' && url === '/api/rooms/room/1') {
    return sendJson(res, 200, room);
  }

  if (req.method === 'GET' && url.startsWith('/api/rooms/roomCode/')) {
    return sendJson(res, 200, 1);
  }

  if (req.method === 'POST' && url.startsWith('/api/rooms/saveRoomState/')) {
    return sendJson(res, 200, 1);
  }

  if (req.method === 'PUT' && url.startsWith('/api/user/1/profile-picture')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let profilePicture = '/assets/avatar.png';
      try {
        const parsed = JSON.parse(body || '{}');
        profilePicture = parsed.profilePicture || profilePicture;
      } catch (e) {}
      return sendJson(res, 200, {
        id: 1,
        username: 'demo-user',
        email: 'demo@brainconnect.app',
        password: '',
        profilePicture,
        rooms: []
      });
    });
    return;
  }

  return sendJson(res, 404, { message: 'Mock API route not found' });
});

server.listen(8080, '127.0.0.1');
