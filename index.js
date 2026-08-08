import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Buffer } from 'buffer';
import App from './App';

global.Buffer = Buffer;

registerRootComponent(App);