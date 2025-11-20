import { AppConfig } from '@config';
import { GameKeys, games } from '@constants/game_types';
import { MongoClient } from 'mongodb';

const _collectionsToEnsure = Object.values(games).map((game) => {
	return `${game.id.toLowerCase()}_logs`;
});

export class MongoDB {
	private static _instance: MongoDB;
	private _client: MongoClient;
	private _database: string = 'logs';

	constructor(uri?: string) {
		// Ex.: 'mongodb://username:password@host:port/databaseName';
		const _uri = uri ?? AppConfig.database.mongodb.uri;

		this._client = new MongoClient(_uri);
	}

	public static initialize(): MongoDB {
		if (!MongoDB._instance) {
			MongoDB._instance = new MongoDB();
		}
		MongoDB._instance._initialize();

		return MongoDB._instance;
	}

	private async _initialize() {
		try {
			await this._client.connect();

			const admin = this._client.db().admin();
			const dbs = await admin.listDatabases();

			const dbExists = dbs.databases.some((db) => db.name === this._database);
			// console.log(
			// 	dbExists
			// 		? `DB ${this._database} already exists.`
			// 		: `DB ${this._database} does not exist.`,
			// );

			const db = this._client.db(this._database);

			const existingCollections = await db.listCollections().toArray();
			const existingNames = existingCollections.map((c) => c.name);

			for (const name of _collectionsToEnsure) {
				if (!existingNames.includes(name)) {
					await db.createCollection(name);
					console.log(`✅ Collection '${name}' created.`);
				} else {
					// console.log(`ℹ️ Collection '${name}' already exists.`);
				}
			}
		} catch (error) {
			//
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
		} catch {
			console.log('Error inserting log into MongoDB');
			//
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
		} catch {
			console.log('Error fetching logs from MongoDB');
		}
		return [];
	}

	// static async disconnect() {}
}

interface Props {
	id: string;
	data: Record<string, any>;
}
