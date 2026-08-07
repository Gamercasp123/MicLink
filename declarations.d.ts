declare module 'react-native-udp' {
  import { EventEmitter } from 'events';

  type UdpSocket = {
    bind(port: number, callback?: () => void): void;
    send(msg: Buffer | Uint8Array, offset: number, length: number, port: number, address: string, callback?: (error: Error | null) => void): void;
    close(): void;
    setBroadcast(value: boolean): void;
    setMulticastLoopback(value: boolean): void;
    on(event: 'error', listener: (error: Error) => void): void;
  };

  export function createSocket(type: 'udp4' | 'udp6'): UdpSocket;
  export default { createSocket };
}

declare module 'react-native-live-audio-stream' {
  type InitParams = {
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
    bufferSize: number;
    wavFile?: string;
  };

  type LiveAudioStream = {
    init(params: InitParams): void;
    start(): void;
    stop(): void;
    on(event: 'data', listener: (data: string) => void): void;
    removeListener(event: 'data', listener: (data: string) => void): void;
  };

  const LiveAudioStream: LiveAudioStream;
  export default LiveAudioStream;
}
