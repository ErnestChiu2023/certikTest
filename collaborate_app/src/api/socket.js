import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8000');

export function sendEdit(edit) {
  console.log('here')
  socket.emit('textEdit', edit);
}