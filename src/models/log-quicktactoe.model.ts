import { Log } from './log.model';

/**
 * ---
 * #### Log Quick Tac Toe Model
 *
 * Represents a game log entry.
 *
 * ---
 * <br/>&nbsp;<br/>
 */
export interface LogQuickTacToe extends Log {
	type: string;
	mode: string;
	winner?: string;
	playerXId: string;
	playerOId: string;
	playerXMoves: string[];
	playerOMoves: string[];
}
