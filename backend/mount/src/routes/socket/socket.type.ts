export type ConnectedUser = {
	idUser: number;
	sockets: string[];
	lastPingTime: number;
	connected: boolean;
	matches: number[];
}

export type DataSocketPing = {
	id: number;
	idConnection?: string;
}