import { Buffer } from 'buffer';
import dgram from 'react-native-udp';

export type UdpSocket = ReturnType<typeof dgram.createSocket> | null;

export function createUdpSocket(onError?: (error: Error) => void) {
  const socket = dgram.createSocket('udp4');

  socket.bind(0, () => {
    socket.setBroadcast(false);
    socket.setMulticastLoopback(false);
  });

  socket.on('error', (error: Error) => {
    if (onError) {
      onError(error);
    }
  });

  return socket;
}

export function closeUdpSocket(socket: UdpSocket) {
  if (!socket) {
    return;
  }

  try {
    socket.close();
  } catch (error) {
    console.warn('Unable to close UDP socket', error);
  }
}

export function sendUdpAudioPacket(socket: UdpSocket, packet: Buffer, targetIp: string, targetPort: number) {
  return new Promise<void>((resolve, reject) => {
    if (!socket) {
      reject(new Error('UDP socket is not initialized'));
      return;
    }

    socket.send(packet, 0, packet.length, targetPort, targetIp, (error: Error | null) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
