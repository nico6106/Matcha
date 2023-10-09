import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

export const socket = io(
    `http://${process.env.REACT_APP_SERVER_ADDRESS}:3333/`, {
		withCredentials: true,
		extraHeaders: {
			'Authorization': 'Bearer YourAuthToken', // Si vous avez besoin d'envoyer un token d'authentification
		},
		
	}
);
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;
