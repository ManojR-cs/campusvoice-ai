const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_complaint', (complaintId) => {
      socket.join(`complaint_${complaintId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined complaint_${complaintId}`);
    });

    socket.on('leave_complaint', (complaintId) => {
      socket.leave(`complaint_${complaintId}`);
    });

    socket.on('join_admin', () => {
      socket.join('admin_channel');
      console.log(`[Socket.IO] Socket ${socket.id} joined admin_channel`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] Warn: Socket.IO not initialized yet');
  }
  return io;
};

const emitComplaintUpdate = (complaintId, data) => {
  if (io) {
    io.to(`complaint_${complaintId}`).emit('complaint_updated', data);
    io.to('admin_channel').emit('admin_complaint_updated', data);
  }
};

const emitNewComplaintAlert = (data) => {
  if (io) {
    io.to('admin_channel').emit('new_complaint', data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitComplaintUpdate,
  emitNewComplaintAlert,
};
