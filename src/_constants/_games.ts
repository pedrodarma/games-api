// type DefaultGame = Omit<Game, 'id'>;

const _games = {
	/** Naval Battle */
	NBT: 'Naval Battle',
	/** Rock Paper Scissors */
	RPS: 'Rock Paper Scissors',
	/** Quick Tac Toe */
	QTT: 'Quick Tac Toe',
	/** Carnaval World */
	CNW: 'Carnaval World',
	/** Planning Poker */
	PNP: 'Planning Poker',
};

export type GameKeys = keyof typeof _games;

export const games: Record<GameKeys, Game> = {
	NBT: {
		id: 'NBT',
		name: _games.NBT,
		maxPlayers: 2,
		minPlayers: 2,
	},
	RPS: {
		id: 'RPS',
		name: _games.RPS,
		maxPlayers: 2,
		minPlayers: 2,
	},
	QTT: {
		id: 'QTT',
		name: _games.QTT,
		maxPlayers: 2,
		minPlayers: 2,
	},
	CNW: {
		id: 'CNW',
		name: _games.CNW,
		maxPlayers: 10,
		minPlayers: 2,
	},
	PNP: {
		id: 'PNP',
		name: _games.PNP,
		maxPlayers: 20,
		minPlayers: 2,
	},
};

/**
 * ---
 * #### Game represents a game entity with its properties.
 *
 * Each game has a unique `id`, a `name`, and associated `images`.
 *
 * The `maxPlayers` and `minPlayers` fields define the player limits for the game.
 *
 * ---
 * <br/>&nbsp;<br/>
 */
export interface Game {
	id: GameKeys;
	name: string;
	// images: GameImages;
	// data: Record<string, DataValue>;
	maxPlayers: number;
	minPlayers: number;
}
