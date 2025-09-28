# 🎮 Terminal Tetris

A beautiful, feature-complete Tetris game that runs directly in your terminal! Built with pure Node.js and no external dependencies.

![Tetris Game](https://img.shields.io/badge/Game-Tetris-blue?style=for-the-badge&logo=gamepad)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen?style=for-the-badge)

## 🎮 Screenshots

<img src="https://github.com/nudelx/terminal-tetris/blob/main/img/img1.png" />

## ✨ Features

- 🎨 **Colorful Graphics** - Beautiful colored blocks with ANSI color support
- 👻 **Ghost Piece** - See where your piece will land
- 🏆 **Scoring System** - Points for line clears and soft drops
- 📈 **Level Progression** - Speed increases with each level
- ⌨️ **Multiple Controls** - Arrow keys or WASD support
- ⏸️ **Pause/Resume** - Press P to pause anytime
- 🎯 **Hard Drop** - Space bar for instant drop
- 🔄 **Rotation** - Full rotation with wall kicks

## 🚀 Quick Start

```bash
# Clone the repository
git clone git@github.com:nudelx/terminal-tetris.git
cd tetris

# Run the game (no installation needed!)
node main.js
```

## 🎮 Controls

| Action     | Key     | Alternative |
| ---------- | ------- | ----------- |
| Move Left  | `←`     | `A`         |
| Move Right | `→`     | `D`         |
| Soft Drop  | `↓`     | `S`         |
| Rotate     | `↑`     | `W`         |
| Hard Drop  | `Space` | -           |
| Pause      | `P`     | -           |
| Quit       | `Q`     | -           |

## 🎯 Game Mechanics

### Scoring

- **Line Clears**: 40, 100, 300, 1200 points (1, 2, 3, 4 lines)
- **Level Bonus**: Score multiplied by (level + 1)
- **Soft Drop**: +1 point per cell
- **Hard Drop**: +2 points

### Level Progression

- **Level Up**: Every 10 lines cleared
- **Speed**: Increases with each level (700ms → 80ms)
- **Max Level**: 10

### Tetrominoes

All 7 classic pieces with unique colors:

- **I** (Cyan) - Line piece
- **O** (Yellow) - Square
- **T** (Purple) - T-shape
- **J** (Blue) - L-shape (mirrored)
- **L** (Orange) - L-shape
- **S** (Green) - S-shape
- **Z** (Red) - Z-shape

## 🛠️ Technical Details

- **Language**: Pure JavaScript (Node.js)
- **Dependencies**: None (zero external packages)
- **Terminal**: ANSI escape sequences for colors and cursor control
- **Architecture**: Event-driven with game loop
- **Size**: Single file (~270 lines)

## 🎨 Visual Features

- **Colorful Blocks**: Each piece type has a unique color
- **Ghost Piece**: Semi-transparent preview of drop position
- **Clean UI**: Unicode box-drawing characters for borders
- **Real-time Updates**: Smooth 60fps game loop
- **Status Display**: Score, level, and lines cleared

## 🏗️ Code Structure

```javascript
// Core Components:
├── Game Board (10×20 grid)
├── Tetromino Definitions (7 pieces with rotations)
├── Collision Detection
├── Line Clearing Logic
├── Input Handling (raw mode)
├── Rendering Engine (ANSI colors)
└── Game State Management
```

## 🎯 Game Rules

1. **Objective**: Clear horizontal lines by filling them completely
2. **Pieces**: Fall from the top, rotate and move left/right
3. **Locking**: Pieces lock when they can't move down further
4. **Line Clear**: Full horizontal lines disappear and award points
5. **Game Over**: When new pieces can't spawn

## 🚀 Performance

- **Lightweight**: Single file, no dependencies
- **Fast**: 60fps game loop with efficient rendering
- **Responsive**: Immediate input handling
- **Memory Efficient**: Minimal memory footprint

## 🤝 Contributing

Contributions are welcome! This is a minimal implementation perfect for:

- Learning game development
- Understanding terminal graphics
- Studying clean code architecture
- Adding new features

## 📝 License

MIT License - feel free to use, modify, and distribute!

---

**Enjoy the classic Tetris experience in your terminal!** 🎮✨
