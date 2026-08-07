import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Buffer } from 'buffer';
import { createUdpSocket, closeUdpSocket, sendUdpAudioPacket, UdpSocket } from './services/network';
import { requestMicrophonePermission } from './services/permissions';
import { initAudioStream, removeAudioListener, startAudioStream, stopAudioStream, computeAudioLevel } from './services/audio';
import { DEFAULT_IP, DEFAULT_PORT } from './config';
import { isValidIp, isValidPort } from './utils/validation';

const App = () => {
  const [targetIp, setTargetIp] = useState(DEFAULT_IP);
  const [targetPort, setTargetPort] = useState(DEFAULT_PORT);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [level, setLevel] = useState(0);
  const socketRef = useRef<UdpSocket>(null);
  const audioListenerRef = useRef<(packet: Uint8Array) => void>();

  const isConnected = status === 'connected';

  const cleanupConnection = useCallback(async () => {
    if (audioListenerRef.current) {
      removeAudioListener(audioListenerRef.current as any);
      audioListenerRef.current = undefined;
    }

    stopAudioStream();
    closeUdpSocket(socketRef.current);
    socketRef.current = null;
    setStatus('disconnected');
    setLevel(0);
  }, []);

  const validateConnectionFields = useCallback(() => {
    if (!isValidIp(targetIp)) {
      Alert.alert('Invalid IP', 'Please enter a valid IPv4 address.');
      return false;
    }

    if (!isValidPort(targetPort)) {
      Alert.alert('Invalid Port', 'Please enter a port number between 1 and 65535.');
      return false;
    }

    return true;
  }, [targetIp, targetPort]);

  const startConnection = useCallback(async () => {
    if (!validateConnectionFields()) {
      return;
    }

    const granted = await requestMicrophonePermission();
    if (!granted) {
      Alert.alert('Permission required', 'Microphone access is required to stream audio.');
      return;
    }

    setStatus('connecting');

    socketRef.current = createUdpSocket((error) => {
      console.warn('Socket error', error);
      setStatus('error');
      cleanupConnection();
    });

    initAudioStream();

    const targetPortNumber = Number(targetPort);
    const handleAudioPacket = async (packet: Uint8Array) => {
      if (!socketRef.current) {
        return;
      }

      setLevel(computeAudioLevel(Buffer.from(packet)));

      try {
        await sendUdpAudioPacket(socketRef.current, Buffer.from(packet), targetIp.trim(), targetPortNumber);
      } catch (error) {
        console.warn('Failed to send UDP packet', error);
        setStatus('error');
        cleanupConnection();
      }
    };

    audioListenerRef.current = handleAudioPacket;
    startAudioStream(handleAudioPacket);
    setStatus('connected');
  }, [cleanupConnection, targetIp, targetPort, validateConnectionFields]);

  const toggleConnection = useCallback(async () => {
    Keyboard.dismiss();

    if (isConnected) {
      await cleanupConnection();
      return;
    }

    await startConnection();
  }, [cleanupConnection, isConnected, startConnection]);

  useEffect(() => {
    return () => {
      cleanupConnection();
    };
  }, [cleanupConnection]);

  const statusText = useMemo(() => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Live';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  }, [status]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.card}>
        <Text style={styles.title}>MicLink</Text>
        <Text style={styles.subtitle}>Stream microphone audio over UDP to your PC.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Target IP</Text>
          <TextInput
            style={styles.input}
            value={targetIp}
            onChangeText={setTargetIp}
            placeholder="192.168.1.100"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Target Port</Text>
          <TextInput
            style={styles.input}
            value={targetPort}
            onChangeText={setTargetPort}
            placeholder="5000"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={[styles.button, isConnected ? styles.buttonDisconnect : styles.buttonConnect]} onPress={toggleConnection}>
          <Text style={styles.buttonLabel}>{isConnected ? 'Disconnect' : 'Connect'}</Text>
        </TouchableOpacity>

        <View style={styles.statusRow}>
          <View style={[styles.statusDot, status === 'connected' ? styles.statusLive : styles.statusOffline]} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <View style={styles.levelMeterContainer}>
          <View style={[styles.levelMeter, { width: `${Math.max(level, 0.05) * 100}%` }]} />
        </View>
        <Text style={styles.levelLabel}>{`Audio level ${Math.round(level * 100)}%`}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  buttonConnect: {
    backgroundColor: '#2563EB',
  },
  buttonDisconnect: {
    backgroundColor: '#EF4444',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusLive: {
    backgroundColor: '#22C55E',
  },
  statusOffline: {
    backgroundColor: '#A1A1AA',
  },
  statusText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  levelMeterContainer: {
    marginTop: 22,
    height: 12,
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  levelMeter: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  levelLabel: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default App;
