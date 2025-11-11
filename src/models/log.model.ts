import { GameKeys } from '@constants/game_types';

/**
 * ---
 * #### Log Model
 *
 * Represents a game log entry.
 *
 * ---
 * <br/>&nbsp;<br/>
 */
export interface Log {
	gameKey: GameKeys;
	hash: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	startedAt: Date;
	finishedAt?: Date;
}
