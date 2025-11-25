import { AppConfig } from '@config';
import { GameKeys, games } from '@constants/game_types';
import { Errors } from '@errors';
import { MongoClient, MongoClientOptions, MongoError } from 'mongodb';

const _collectionsToEnsure = Object.values(games).map((game) => {
	return `${game.id.toLowerCase()}_logs`;
});

export class MongoDB {
	private static _instance: MongoDB;
	private _client: MongoClient;
	private _database: string = 'logs';
	private _options: MongoClientOptions = {
		maxPoolSize: 20,
		wtimeoutMS: 2500,
		retryReads: true,
		retryWrites: true,
	};

	private constructor(uri?: string) {
		// Ex.: 'mongodb://username:password@host:port/databaseName';
		const _uri = uri ?? AppConfig.database.mongodb.uri;

		this._client = new MongoClient(_uri, this._options);
	}

	public static initialize(uri?: string): MongoDB {
		if (!MongoDB._instance) {
			MongoDB._instance = new MongoDB(uri);
			MongoDB._instance._initialize();
		}

		return MongoDB._instance;
	}

	private async _initialize() {
		try {
			await this._connectIfNeeded();

			await this._createDatabaseIfNotExists();

			await this._createCollectionIfNotExists();
		} catch {
			//
		}
	}

	private async _isConnected(): Promise<boolean> {
		try {
			await this._client.db().admin().ping();
			return true;
		} catch {
			return false;
		}
	}

	private async _connect() {
		await this._client.connect();
	}

	private async _disconnect() {
		await this._client.close();
	}

	private async _connectIfNeeded() {
		const connected = await this._isConnected();
		this._client.addListener;
		if (!connected) {
			await this._connect();
		}
	}

	private async _createDatabaseIfNotExists() {
		const admin = this._client.db().admin();
		const dbs = await admin.listDatabases();

		const dbExists = dbs.databases.some((db) => db.name === this._database);
		if (!dbExists) {
			// eslint-disable-next-line no-console
			console.log(`Creating database: ${this._database}`);
			// Create the database by creating a collection
			const db = this._client.db(this._database);
			await db.createCollection('init_collection');
			await db.collection('init_collection').drop();
			// eslint-disable-next-line no-console
			console.log(`Database ${this._database} created.`);
		} else {
			// console.log(`Database ${this._database} already exists.`);
		}
	}

	private async _createCollectionIfNotExists() {
		const db = this._client.db(this._database);

		const existingCollections = await db.listCollections().toArray();
		const existingNames = existingCollections.map((c) => c.name);

		for (const name of _collectionsToEnsure) {
			if (!existingNames.includes(name)) {
				await db.createCollection(name);
				// eslint-disable-next-line no-console
				console.log(`✅ Collection '${name}' created.`);
			} else {
				// console.log(`ℹ️ Collection '${name}' already exists.`);
			}
		}
	}

	public async insert(
		gameKey: GameKeys,
		{ data }: Omit<Props, 'id'>,
	): Promise<boolean> {
		try {
			const collectionName = `${gameKey.toLowerCase()}_logs`;
			const database = this._client?.db(this._database);
			const collection = database?.collection(collectionName);
			const result = await collection?.insertOne(data);
			if (result && result.insertedId) {
				return true;
			}
		} catch (error) {
			const _err =
				error instanceof MongoError || error instanceof Error
					? error
					: new Error(error as any);
			throw Errors.database(_err);
		}
		return false;
	}

	public async fetch(gameKey: GameKeys) {
		try {
			const collectionName = `${gameKey.toLowerCase()}_logs`;
			const database = this._client?.db(this._database);
			const collection = database?.collection(collectionName);
			const result = await collection?.find({}).toArray();

			if (result) {
				return result;
			}
		} catch (error) {
			const _err =
				error instanceof MongoError || error instanceof Error
					? error
					: new Error(error as any);
			throw Errors.database(_err);
		}
		return [];
	}
}

interface Props {
	id: string;
	data: Record<string, any>;
}
