# train.py
import numpy as np
from pymongo import MongoClient
import mlx.core as mx
import mlx.nn as nn
import mlx.optimizers as optim
import json
import os

# ========================
# CONFIGURAÇÕES
# ========================
MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:G49vm222-3d02ksc!@192.168.15.17:27018/")
DB_NAME = "logs"
COLLECTION = "qtt_logs"
# MODEL_PATH = "/models/tictactoe_model.mlx"
# MODEL_PATH = "/tictactoe_model.mlx"
MODEL_PATH = "./tictactoe_model.safetensors"

# ========================
# FUNÇÕES DE PREPARO
# ========================

def position_to_index(pos):
    # Converte "a0", "b1", etc. em índice 0..8
    mapping = {'a': 0, 'b': 1, 'c': 2}
    col = mapping[pos[0]]
    row = int(pos[1])
    return row * 3 + col

def board_from_moves(moves_x, moves_o):
    board = np.zeros(9, dtype=np.float32)
    for m in moves_x:
        board[position_to_index(m)] = 1
    for m in moves_o:
        board[position_to_index(m)] = -1
    return board

def create_dataset(games):
    X, y = [], []
    for g in games:
        moves_x = g.get("playerXMoves", [])
        moves_o = g.get("playerOMoves", [])
        winner = g.get("winner")

        # Cria o estado final do tabuleiro
        board = board_from_moves(moves_x, moves_o)

        # Gera um label simples: quem venceu
        # 1 = X venceu, -1 = O venceu, 0 = empate
        if winner == g.get("playerXId"):
            label = 1
        elif winner == g.get("playerOId"):
            label = -1
        else:
            label = 0

        X.append(board)
        y.append(label)

    return np.array(X), np.array(y, dtype=np.float32).reshape(-1, 1)

def mse_loss(pred, target):
    return mx.mean((pred - target) ** 2)

# ========================
# DEFINIÇÃO DO MODELO
# ========================

class TicTacToeNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(9, 32)
        self.fc2 = nn.Linear(32, 16)
        self.fc3 = nn.Linear(16, 1)
        self.relu = nn.ReLU()

    def __call__(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        return mx.sigmoid(self.fc3(x))  # saída entre 0 e 1

# ========================
# TREINAMENTO
# ========================

def train():
    print("Conectando ao MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    games = list(db[COLLECTION].find({"status": "finished"}))
    print(f"{len(games)} partidas carregadas.")

    X, y = create_dataset(games)
    print("Dataset:", X.shape, y.shape)

    model = TicTacToeNet()
    optimizer = optim.Adam(learning_rate=0.001)

    def loss_fn(model, X, y):
        preds = model(X)
        return mx.mean((preds - y) ** 2)

    # Treino
    for epoch in range(10000):
        loss, grads = mx.value_and_grad(loss_fn)(model, mx.array(X), mx.array(y))
        optimizer.update(model, grads)
        if epoch % 10 == 0:
            print(f"Epoch {epoch}: loss={loss.item():.4f}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    model.save_weights(MODEL_PATH)
    print("✅ Modelo salvo em:", MODEL_PATH)

if __name__ == "__main__":
    train()
