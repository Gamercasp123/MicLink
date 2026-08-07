import { Buffer } from 'buffer';
import LiveAudioStream from 'react-native-live-audio-stream';
import { BUFFER_SIZE, BITS_PER_SAMPLE, CHANNELS, SAMPLE_RATE } from '../config';

export type AudioPacketListener = (packet: Buffer) => void;

export function initAudioStream() {
  LiveAudioStream.init({
    sampleRate: SAMPLE_RATE,
    channels: CHANNELS,
    bitsPerSample: BITS_PER_SAMPLE,
    bufferSize: BUFFER_SIZE,
    wavFile: 'miclink.raw',
  });
}

export function startAudioStream(listener: AudioPacketListener) {
  LiveAudioStream.on('data', (base64String: string) => {
    listener(Buffer.from(base64String, 'base64'));
  });
  LiveAudioStream.start();
}

export function stopAudioStream() {
  try {
    LiveAudioStream.stop();
  } catch (error) {
    console.warn('Audio stream stop failed', error);
  }
}

export function removeAudioListener(listener: AudioPacketListener) {
  try {
    LiveAudioStream.removeListener('data', listener as any);
  } catch (error) {
    console.warn('Failed to remove audio listener', error);
  }
}

export function computeAudioLevel(packet: Buffer) {
  if (packet.length < 2) {
    return 0;
  }

  let sum = 0;
  const count = Math.floor(packet.length / 2);

  for (let index = 0; index < count; index += 1) {
    const sample = packet.readInt16LE(index * 2);
    sum += sample * sample;
  }

  const rms = Math.sqrt(sum / count);
  return Math.min(1, rms / 32768);
}
