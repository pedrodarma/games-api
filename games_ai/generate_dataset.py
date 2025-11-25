# print("Hello from games_ai/play.py")

from pymongo import MongoClient
import numpy as np
import pandas as pd


POSITION_MAP = {
    "a0": 0, "a1": 1, "a2": 2,
    "b0": 3, "b1": 4, "b2": 5,
    "c0": 6, "c1": 7, "c2": 8,
}

def convert_games_to_samples():
    client = MongoClient("mongodb://admin:G49vm222-3d02ksc!@192.168.15.17:27018/")
    db = client["logs"]
    # games = db["qtt_logs"].find({"status": "finished", "winner": {"$ne": None}})
    games = db["qtt_logs"].find({"status": "finished", "type": {"$eq": "game_over_win"}})

    samples = []

    print("Converting games to samples...")
    # print("Total games found:", games.total())

    for game in games:
        board = [0]*9
        winner = game.get("winner")
        x_id = game.get("playerXId")
        o_id = game.get("playerOId")

        # print(game)

        x_moves = [POSITION_MAP[m] for m in game.get("playerXMoves", [])]
        o_moves = [POSITION_MAP[m] for m in game.get("playerOMoves", [])]

        # print("X moves:", x_moves)
        # print("O moves:", o_moves)

        board = [0]*9
        for i in range(len(x_moves)):
            board[x_moves[i]] = 1
        
        for i in range(len(o_moves)):
            board[o_moves[i]] = -1
        
        state = board.copy()

        print("Final board state:", state)

        # # Reconstroi o jogo movimento a movimento
        # for i in range(max(len(x_moves), len(o_moves))):
        #     # Jogada do X
        #     if i < len(x_moves):
        #         move = x_moves[i]
        #         state = board.copy()
        #         samples.append({
        #             "board": state,
        #             "player": 1,
        #             "move": move,
        #             "winner": 1 if winner == x_id else -1
        #         })
        #         board[move] = 1

        #     # Jogada do O
        #     if i < len(o_moves):
        #         move = o_moves[i]
        #         state = board.copy()
        #         samples.append({
        #             "board": state,
        #             "player": -1,
        #             "move": move,
        #             "winner": 1 if winner == o_id else -1
        #         })
        #         board[move] = -1

    return samples

# Exemplo de uso:
if __name__ == "__main__":
    samples = convert_games_to_samples()
    print(samples[:5])  # mostra as 5 primeiras amostras

    rows = []
    for s in samples:
        rows.append({
            **{f"cell_{i}": v for i, v in enumerate(s["board"])},
            "player": s["player"],
            "move": s["move"],
            "winner": s["winner"]
        })

    df = pd.DataFrame(rows)
    df.to_csv("tictactoe_dataset.csv", index=False)
    print("Dataset salvo com", len(df), "amostras")
