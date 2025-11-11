import { MongoDB } from '@databases';
import { LogQuickTacToe, WebSocketMessage } from '@models';
import { LogsRepository } from '@repositories';
import WebSocket from 'ws';

export class WebsocketClient {
	private static _instance: WebsocketClient;
	private _client?: WebSocket;
	private _channel: string = 'logs';

	constructor() {
		//
	}

	public static initialize(uri?: string): WebsocketClient {
		if (!WebsocketClient._instance) {
			WebsocketClient._instance = new WebsocketClient();
		}
		WebsocketClient._instance._initialize(uri);

		return WebsocketClient._instance;
	}

	public static reconnect(uri?: string): void {
		if (WebsocketClient._instance && WebsocketClient._instance._client) {
			WebsocketClient._instance._client.close();
			WebsocketClient._instance._client = undefined;
		}
		WebsocketClient._instance?._initialize(uri);
	}

	private async _initialize(uri?: string) {
		try {
			const _uri = process.env.BROKER_URL || '';
			if (!this._client) {
				console.log(
					`Connecting to WebSocket at ${uri ?? _uri}/${this._channel}`,
				);
				this._client = new WebSocket(`${uri ?? _uri}/${this._channel}`);

				if (this._client) {
					// Register client after connection opens
					this._client.onopen = _onOpen;
					this._client.onmessage = _onMessage;
					this._client.onclose = _onClose;
					this._client.onerror = _onError;
				}
			}
		} catch (error) {
			//
		}
	}
}

function _onOpen(ev: WebSocket.Event) {
	// eslint-disable-next-line no-console
	// console.log('WebSocket connection opened:', ev);
}

function _onMessage(this: WebSocket, event: WebSocket.MessageEvent) {
	// eslint-disable-next-line no-console
	// console.log('WebSocket message received:', event.data);
	const formated = Buffer.from(event.data.toString()).toString('ascii');
	const message = JSON.parse(formated) as WebSocketMessage;

	if (event.data === 'ping' || message.data.ping === 'ping') {
		this.send(JSON.stringify({ type: 'pong' }));
		return;
	}
	if (event.data === 'pong' || message.data.ping === 'pong') {
		return;
	}

	// const message = JSON.parse(event.data) as WebSocketMessage;

	if (message.type === 'event' && message.data.event === 'new_server') {
		// eslint-disable-next-line no-console
		console.log('WebSocket registered message:', message);
		return;
	}

	if (message.type === 'log') {
		// eslint-disable-next-line no-console
		console.log('WebSocket log message:', message);

		const data = message.data as LogQuickTacToe;
		const repository = new LogsRepository(new MongoDB());
		repository.addLog(data.gameKey, data);

		return;
	}
}

function _onClose(ev: WebSocket.Event) {
	// eslint-disable-next-line no-console
	console.log('WebSocket connection closed:', ev);

	setTimeout(() => {
		WebsocketClient.reconnect();
	}, 5000);
}

function _onError(ev: WebSocket.Event) {
	// eslint-disable-next-line no-console
	console.error('WebSocket error occurred:', ev);

	setTimeout(() => {
		WebsocketClient.reconnect();
	}, 5000);
}
