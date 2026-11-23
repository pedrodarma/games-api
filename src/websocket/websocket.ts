import { AppConfig } from '@config';
import { MongoDB } from '@databases';
import { Errors } from '@errors';
import { LogQuickTacToe, WebSocketMessage } from '@models';
import { LogsRepository } from '@repositories';
import WebSocket from 'ws';

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

export class WebsocketClient {
	private static _instance: WebsocketClient;
	private _client?: WebSocket;
	private _channel: string = 'logs';
	private _uri?: string;
	private _reconnectTimer?: NodeJS.Timeout;
	private _reconnectAttempts: number = 0;

	constructor() {
		//
	}

	public static initialize(uri?: string): WebsocketClient {
		if (!WebsocketClient._instance) {
			WebsocketClient._instance = new WebsocketClient();
			WebsocketClient._instance._connect(uri);
		}

		return WebsocketClient._instance;
	}

	/**
	 * Forces a fresh connection, discarding the current socket (if any).
	 * Events from the discarded socket are ignored, so this never schedules
	 * extra reconnections.
	 */
	public static reconnect(uri?: string): void {
		const instance = WebsocketClient._instance;
		if (!instance) return;

		instance._clearReconnectTimer();

		const old = instance._client;
		instance._client = undefined;
		old?.terminate();

		instance._connect(uri);
	}

	private _connect(uri?: string) {
		if (uri) this._uri = uri;
		if (this._client) return;

		const url = `${this._uri ?? AppConfig.websocket.brokerUrl}/${this._channel}`;

		try {
			// eslint-disable-next-line no-console
			console.log(`Connecting to WebSocket at ${url}`);
			const socket = new WebSocket(url);
			this._client = socket;

			// Handlers check `this._client === socket` so that events coming from a
			// socket that was already replaced are ignored.
			socket.onopen = () => {
				if (this._client !== socket) return;
				this._reconnectAttempts = 0;
				// eslint-disable-next-line no-console
				console.log(`WebSocket connected at ${url}`);
			};

			socket.onmessage = (event) => {
				if (this._client !== socket) return;
				_onMessage(socket, event);
			};

			// `ws` always emits `close` after `error`, so reconnection is handled
			// only in `onclose`. The error listener must stay attached, otherwise
			// the emitter throws on unhandled `error` events.
			socket.onerror = (event) => {
				if (this._client !== socket) return;
				// eslint-disable-next-line no-console
				console.error(`WebSocket error: ${event.message}`);
			};

			socket.onclose = () => {
				if (this._client !== socket) return;
				this._client = undefined;
				this._scheduleReconnect();
			};
		} catch (error) {
			this._client = undefined;
			const _err = error instanceof Error ? error : new Error(error as any);
			// eslint-disable-next-line no-console
			console.error(Errors.websocket(_err).message);
			this._scheduleReconnect();
		}
	}

	private _scheduleReconnect() {
		// Only one pending reconnection at a time.
		if (this._reconnectTimer) return;

		const delay = Math.min(
			RECONNECT_BASE_DELAY_MS * 2 ** this._reconnectAttempts,
			RECONNECT_MAX_DELAY_MS,
		);
		this._reconnectAttempts++;

		// eslint-disable-next-line no-console
		console.warn(`WebSocket disconnected. Reconnecting in ${delay / 1000}s...`);

		this._reconnectTimer = setTimeout(() => {
			this._reconnectTimer = undefined;
			this._connect();
		}, delay);
	}

	private _clearReconnectTimer() {
		if (this._reconnectTimer) {
			clearTimeout(this._reconnectTimer);
			this._reconnectTimer = undefined;
		}
	}
}

/**
 * Decodes a `ws` payload as UTF-8, handling every `WebSocket.Data` variant
 * (string, Buffer, Buffer[] and ArrayBuffer).
 */
function _decode(data: WebSocket.Data): string {
	if (typeof data === 'string') return data;
	if (Buffer.isBuffer(data)) return data.toString('utf8');
	if (Array.isArray(data)) return Buffer.concat(data).toString('utf8');
	return Buffer.from(data).toString('utf8');
}

function _onMessage(socket: WebSocket, event: WebSocket.MessageEvent) {
	const raw = _decode(event.data);

	if (raw === 'ping') {
		socket.send(JSON.stringify({ type: 'pong' }));
		return;
	}
	if (raw === 'pong') {
		return;
	}

	let message: WebSocketMessage;
	try {
		message = JSON.parse(raw) as WebSocketMessage;
	} catch {
		// eslint-disable-next-line no-console
		console.warn('WebSocket received a non-JSON message, ignoring it.');
		return;
	}

	if (message?.data?.ping === 'ping') {
		socket.send(JSON.stringify({ type: 'pong' }));
		return;
	}
	if (message?.data?.ping === 'pong') {
		return;
	}

	if (message.type === 'event' && message.data?.event === 'new_server') {
		// eslint-disable-next-line no-console
		console.log('WebSocket registered message:', message);
		return;
	}

	if (message.type === 'log') {
		// eslint-disable-next-line no-console
		console.log('WebSocket log message:', message);

		const data = message.data as LogQuickTacToe;
		const repository = new LogsRepository(MongoDB.initialize());
		repository.addLog(data.gameKey, data).catch((error) => {
			const _err = error instanceof Error ? error : new Error(error as any);
			// eslint-disable-next-line no-console
			console.error(Errors.websocket(_err).message);
		});

		return;
	}
}
