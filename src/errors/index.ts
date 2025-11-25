import { MongoError } from 'mongodb';

export const enum ErrorTypes {
	UNKNOWN_ERROR = 'An unknown error occurred.',
	DATABASE_CONNECTION_FAILED = 'Failed to connect to the database.',
	INVALID_INPUT = 'The provided input is invalid.',
	NOT_FOUND = 'The requested resource was not found.',
	AUTHENTICATION_FAILED = 'Authentication failed. Please check your credentials.',
	PERMISSION_DENIED = 'You do not have permission to perform this action.',
	SERVER_ERROR = 'An internal server error occurred.',
	TIMEOUT_ERROR = 'The operation timed out. Please try again later.',
}

export const Errors = {
	database: _handle,
	websocket: _handle,
	controllers: _handle,
};

function _handle(error: Error | MongoError) {
	let _error: Error;
	if (error instanceof MongoError) {
		_error = _handleMongoError(error);
	}
	if (error instanceof Error) {
		_error = _handleError(error);
	}

	return _error!;
}

function _handleError(error: Error) {
	const file = error.stack?.split('\n')[1] || 'unknown location';
	const line = file.match(/:(\d+):\d+\)?$/)?.[1] || 'unknown line';
	const message = `Error: ${error.message} at ${file.trim()} (line ${line})`;

	return new Error(message);
}

function _handleMongoError(error: MongoError) {
	const file = error.stack?.split('\n')[1] || 'unknown location';
	const line = file.match(/:(\d+):\d+\)?$/)?.[1] || 'unknown line';
	const message = `MongoError: ${error.message} (code: ${
		error.code
	}) at ${file.trim()} (line ${line})`;

	return new Error(message);
}
