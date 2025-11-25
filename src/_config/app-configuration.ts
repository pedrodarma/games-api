/**
 * Application Configuration
 *
 * Centralized configuration management with environment variable validation.
 * This module validates all required environment variables and provides
 * type-safe access to configuration values.
 */

// Ensure dotenv is loaded before accessing process.env
import dotenv from 'dotenv';
dotenv.config();

interface AppConfig {
	server: {
		port: number;
		nodeEnv: string;
	};
	database: {
		mongodb: {
			uri: string;
		};
	};
	websocket: {
		brokerUrl: string;
	};
	redis: {
		host: string;
		port: number;
		username: string;
		password: string;
	};
}

/**
 * Validates that a required environment variable is present.
 * Throws an error with a descriptive message if the variable is missing.
 */
function validateRequiredEnv(
	key: string,
	value: string | undefined,
	description?: string,
): string {
	if (!value || value.trim() === '') {
		const errorMessage = description
			? `Missing required environment variable: ${key}\nDescription: ${description}\n\nPlease set ${key} in your .env file or environment.`
			: `Missing required environment variable: ${key}\n\nPlease set ${key} in your .env file or environment.`;

		throw new Error(errorMessage);
	}
	return value;
}

/**
 * Gets an optional environment variable with a default value.
 */
function getOptionalEnv(key: string, defaultValue: string): string {
	return process.env[key] || defaultValue;
}

/**
 * Gets an optional numeric environment variable with a default value.
 */
function getOptionalNumberEnv(key: string, defaultValue: number): number {
	const value = process.env[key];
	if (value === undefined || value === '') {
		return defaultValue;
	}
	const parsed = parseInt(value, 10);
	if (isNaN(parsed)) {
		// eslint-disable-next-line no-console
		console.warn(
			`Warning: ${key} is not a valid number. Using default value: ${defaultValue}`,
		);
		return defaultValue;
	}
	return parsed;
}

/**
 * Application configuration object with validated environment variables.
 * This object is initialized immediately when the module is imported.
 *
 * @throws {Error} If any required environment variable is missing
 */
export const AppConfig: AppConfig = (() => {
	const mongodbUri = validateRequiredEnv(
		'MONGODB',
		process.env.MONGODB,
		'MongoDB connection URI (e.g., mongodb://username:password@host:port/databaseName)',
	);

	const brokerUrl = validateRequiredEnv(
		'BROKER_URL',
		process.env.BROKER_URL,
		'WebSocket broker URL for real-time log ingestion (e.g., ws://broker-url:port)',
	);

	const port = getOptionalNumberEnv('PORT', 8060);
	const nodeEnv = getOptionalEnv('NODE_ENV', 'development');
	const redisHost = getOptionalEnv('REDIS_HOST', 'localhost');
	const redisPort = getOptionalNumberEnv('REDIS_PORT', 6379);
	const redisUsername = getOptionalEnv('REDIS_USERNAME', 'admin');
	const redisPassword = getOptionalEnv('REDIS_PASSWORD', 'default');

	return {
		server: {
			port,
			nodeEnv,
		},
		database: {
			mongodb: {
				uri: mongodbUri,
			},
		},
		websocket: {
			brokerUrl,
		},
		redis: {
			host: redisHost,
			port: redisPort,
			username: redisUsername,
			password: redisPassword,
		},
	};
})();

/**
 * Helper function to check if the application is running in production mode.
 */
export function isProduction(): boolean {
	return AppConfig.server.nodeEnv === 'production';
}

/**
 * Helper function to check if the application is running in development mode.
 */
export function isDevelopment(): boolean {
	return AppConfig.server.nodeEnv === 'development';
}

/**
 * Helper function to check if the application is running in test mode.
 */
export function isTest(): boolean {
	return AppConfig.server.nodeEnv === 'test';
}
