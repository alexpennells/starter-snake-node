const snek = {
  state: {},
  star: 0,
  port: 0,
  bow: 0,
  stern: 0,

  start: () => {
    return {
      color: '#ff3377',
      headType: 'silly',
      tailType: 'bolt',
    };
  },

  end: () => {
    return {};
  },

  move: request => {
    this.state = request.body;
    this.port = this.star = this.bow = this.stern = 0

    const board = this.createNewBoard();
    this.addSneksToBoard(board);

    const initialPossibleMoves = this.getPossibleMoves(board);

    const duppedBoard = this.createNewBoard();
    this.addSneksToBoard(duppedBoard);

    this.addEnemySneks(board)
    this.addEnemySneks(duppedBoard)

    this.markDeadEnds(board, duppedBoard, initialPossibleMoves)

    const possibleMoves = this.getPossibleMoves(board);

    let food = false;
    if (this.state.you.health < 50)
      food = this.findFood();
    else if (this.biggestSnake() >= this.state.you.body.length - 2)
      food = this.findFood();

    return {
      move: this.determineMove(initialPossibleMoves, possibleMoves, food),
    };
  },

  createNewBoard: () => {
    let newBoard = new Array();
    for (let x = 0; x < this.state.board.width; x++) {
      newBoard[x] = new Array();
      for (let y = 0; y < this.state.board.height; y++) {
        newBoard[x][y] = 0;
      }
    }
    return newBoard;
  },

  addSneksToBoard: board => {
    this.state.board.snakes.forEach(snake =>
      snake.body.forEach(point => {
        this.updateBoard(point.x, point.y, 1, board);
      })
    );
  },

  updateBoard: (x, y, val, board) => {
    board[y][x] = val;
  },

  getPossibleMoves: board => {
    const x = this.state.you.body[0].x;
    const y = this.state.you.body[0].y;
    const removeFromArray = (arr, val) => arr.filter(el => el != val);

    let availableMoves = ["up", "down", "left", "right"];
    if (x === 0 || board[y][x - 1] !== 0) {
      availableMoves = removeFromArray(availableMoves, "left");
    }
    if (x === state.board.width - 1 || board[y][x + 1] !== 0) {
      availableMoves = removeFromArray(availableMoves, "right");
    }
    if (y === 0 || board[y - 1][x] !== 0) {
      availableMoves = removeFromArray(availableMoves, "up");
    }
    if (y === state.board.height - 1 || board[y + 1][x] !== 0) {
      availableMoves = removeFromArray(availableMoves, "down");
    }
    return availableMoves;
  },

  addEnemySneks: board => {
    const enemySnakes = this.state.board.snakes.filter(snake => !(snake.body[0].x === this.state.you.body[0].x && snake.body[0].y === this.state.you.body[0].y))
    enemySnakes.forEach(snake => {
      if (snake.body.length >= this.state.you.body.length) {
        if (snake.body[0].x > 0) {
          this.updateBoard(snake.body[0].x -1, snake.body[0].y, 1, board)
        }
        if (snake.body[0].x < this.state.board.width -1) {
          this.updateBoard(snake.body[0].x +1, snake.body[0].y, 1, board)
        }
        if (snake.body[0].y > 0) {
          this.updateBoard(snake.body[0].x, snake.body[0].y -1, 1, board)
        }
        if (snake.body[0].y < this.state.board.height -1) {
          this.updateBoard(snake.body[0].x, snake.body[0].y + 1, 1, board)
        }
      }
    })
  },

  markDeadEnds: (board, duppedBoard, possibleMoves) => {
    possibleMoves.forEach(move => {
      if (move === "right") {
        this.star = this.spacesCount(duppedBoard, this.state.you.body[0].x + 1, this.state.you.body[0].y, 2);
        if (this.star > 0 && this.star < 15) this.copyToBoard(2, board, duppedBoard);
      } else if (move === "left") {
        this.port = this.spacesCount(duppedBoard, this.state.you.body[0].x - 1, this.state.you.body[0].y, 3);
        if (this.port > 0 && this.port < 15) this.copyToBoard(3, board, duppedBoard);
      } else if (move === "down") {
        this.stern = this.spacesCount(duppedBoard, this.state.you.body[0].x, this.state.you.body[0].y + 1, 4);
        if (this.stern > 0 && this.stern < 15) this.copyToBoard(4, board, duppedBoard);
      } else if (move === "up") {
        this.bow = this.spacesCount(duppedBoard, this.state.you.body[0].x, this.state.you.body[0].y - 1, 5);
        if (this.bow > 0 && this.bow < 15) this.copyToBoard(5, board, duppedBoard);
      }
    });
  },

  spacesCount: (board, x, y, fill) => {
    let right = 0;
    let left = 0;
    let down = 0;
    let up = 0;

    if (board[y][x] !== 0) return 0;
    board[y][x] = fill;

    if (x < this.state.board.width - 1) {
      right = this.spacesCount(board, x + 1, y, fill);
    }
    if (x > 0) {
      left = this.spacesCount(board, x - 1, y, fill);
    }
    if (y < this.state.board.height - 1) {
      down = this.spacesCount(board, x, y + 1, fill);
    }
    if (y > 0) {
      up = this.spacesCount(board, x, y - 1, fill);
    }
    return 1 + right + left + up + down;
  },

  copyToBoard: (fill, board, duppedBoard) => {
    for (let y = 0; y < duppedBoard.length; y++)
      for (let x = 0; x < duppedBoard[y].length; x++)
        if (duppedBoard[y][x] === fill)
          board[y][x] = 1;
  },

  findFood: () => {
    if (this.state.board.food.length !== 0) {
      return this.state.board.food.map(food =>
        Object.assign({}, food, { dist: this.calculateDistance(this.state.you.body[0], food) })
      ).reduce((prev, curr) => (prev.dist < curr.dist ? prev : curr));
    }

    return false;
  },

  calculateDistance: (snakeHead, food) => {
    const xDist = Math.abs(snakeHead.x - food.x);
    const yDist = Math.abs(snakeHead.y - food.y);
    return xDist + yDist;
  },

  biggestSnake: () => {
    return Math.max(...this.state.board.snakes.filter(snake => !(snake.body[0].x === this.state.you.body[0].x && snake.body[0].y === this.state.you.body[0].y))
    .map(snake => snake.body.length))
  },

  determineMove: (initialPossibleMoves, possibleMoves, food) => {
    if (initialPossibleMoves.length === 1) {
      return initialPossibleMoves[Math.floor(Math.random() * initialPossibleMoves.length)]
    } else if (possibleMoves.length == 0) {
      if (this.stern > 0 && this.stern >= this.star && this.stern >= this.port && this.stern >= this.bow)
        return "down"
      else if (this.stern > 0 && this.bow >= this.star && this.bow >= this.port && this.bow >= this.stern)
        return "up"
      else if (this.stern > 0 && this.star >= this.bow && this.star >= this.port && this.star >= this.stern)
        return "right"
      else if (this.stern > 0 && this.port >= this.bow && this.port >= this.star && this.port >= this.stern)
        return "left"
      else
        return initialPossibleMoves[Math.floor(Math.random() * initialPossibleMoves.length)]
    } else if (possibleMoves.length == 1) {
      return possibleMoves[0]
    } else if (food) {
      const xDistance = (head, p) => { return p.x - head.x };
      const yDistance = (head, p) => { return p.y - head.y };

      if (possibleMoves.includes("right") && xDistance(this.state.you.body[0], food) > 0)
        return "right";
      else if (possibleMoves.includes("left") && xDistance(this.state.you.body[0], food) < 0)
        return "left";
      else if (possibleMoves.includes("down") && yDistance(this.state.you.body[0], food) > 0)
        return "down";
      else if (possibleMoves.includes("up") && yDistance(this.state.you.body[0], food) < 0)
        return "up";
      else
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else {
      return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
    }
  },
};

module.exports = {
  snek,
}
