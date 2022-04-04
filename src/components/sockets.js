import {io} from 'socket.io-client'
import React from 'react';

export const socket = io('https://salty-everglades-98832.herokuapp.com/');
export const SocketContext = React.createContext();