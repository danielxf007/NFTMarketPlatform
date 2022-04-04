import {io} from 'socket.io-client'

export const socket = io('https://salty-everglades-98832.herokuapp.com/');
export const SocketContext = React.createContext();