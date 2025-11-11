import { GameKeys } from '@constants/game_types';
import { MongoDB } from '@databases';
import { Log } from '@models';

export class LogsRepository {
	private _db: MongoDB;

	constructor(db: MongoDB) {
		this._db = db;
	}

	public async addLog(gameKey: GameKeys, data: Omit<Log, 'id'>) {
		return this._db.insert(gameKey, { data });
	}

	public async fetchLogs(gameKey: GameKeys) {
		return this._db.fetch(gameKey);
	}
}
