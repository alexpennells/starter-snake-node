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
    state = request.body;
    port = star = bow = stern = 0

    const board = createNewBoard();
    addSneksToBoard(board);

    const initialPossibleMoves = getPossibleMoves(board);

    const duppedBoard = createNewBoard();
    addSneksToBoard(duppedBoard);

    addEnemySneks(board)
    addEnemySneks(duppedBoard)

    markDeadEnds(board, duppedBoard, initialPossibleMoves)

    const possibleMoves = getPossibleMoves(board);

    let food = false;
    if (state.you.health < 50)
      food = findFood();
    else if (biggestSnake() >= state.you.body.length - 2)
      food = findFood();

    return {
      move: determineMove(initialPossibleMoves, possibleMoves, food),
    };
  },

  createNewBoard: () => {
    let newBoard = new Array();
    for (let x = 0; x < state.board.width; x++) {
      newBoard[x] = new Array();
      for (let y = 0; y < state.board.height; y++) {
        newBoard[x][y] = 0;
      }
    }
    return newBoard;
  },

  addSneksToBoard: board => {
    state.board.snakes.forEach(snake =>
      snake.body.forEach(point => {
        updateBoard(point.x, point.y, 1, board);
      })
    );
  },

  updateBoard: (x, y, val, board) => {
    board[y][x] = val;
  },

  getPossibleMoves: board => {
    const x = state.you.body[0].x;
    const y = state.you.body[0].y;
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
    const enemySnakes = state.board.snakes.filter(snake => !(snake.body[0].x === state.you.body[0].x && snake.body[0].y === state.you.body[0].y))
    enemySnakes.forEach(snake => {
      if (snake.body.length >= state.you.body.length) {
        if (snake.body[0].x > 0) {
          updateBoard(snake.body[0].x -1, snake.body[0].y, 1, board)
        }
        if (snake.body[0].x < state.board.width -1) {
          updateBoard(snake.body[0].x +1, snake.body[0].y, 1, board)
        }
        if (snake.body[0].y > 0) {
          updateBoard(snake.body[0].x, snake.body[0].y -1, 1, board)
        }
        if (snake.body[0].y < state.board.height -1) {
          updateBoard(snake.body[0].x, snake.body[0].y + 1, 1, board)
        }
      }
    })
  },

  markDeadEnds: (board, duppedBoard, possibleMoves) => {
    possibleMoves.forEach(move => {
      if (move === "right") {
        star = spacesCount(duppedBoard, state.you.body[0].x + 1, state.you.body[0].y, 2);
        if (star > 0 && star < 15) copyToBoard(2, board, duppedBoard);
      } else if (move === "left") {
        port = spacesCount(duppedBoard, state.you.body[0].x - 1, state.you.body[0].y, 3);
        if (port > 0 && port < 15) copyToBoard(3, board, duppedBoard);
      } else if (move === "down") {
        stern = spacesCount(duppedBoard, state.you.body[0].x, state.you.body[0].y + 1, 4);
        if (stern > 0 && stern < 15) copyToBoard(4, board, duppedBoard);
      } else if (move === "up") {
        bow = spacesCount(duppedBoard, state.you.body[0].x, state.you.body[0].y - 1, 5);
        if (bow > 0 && bow < 15) copyToBoard(5, board, duppedBoard);
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

    if (x < state.board.width - 1) {
      right = spacesCount(board, x + 1, y, fill);
    }
    if (x > 0) {
      left = spacesCount(board, x - 1, y, fill);
    }
    if (y < state.board.height - 1) {
      down = spacesCount(board, x, y + 1, fill);
    }
    if (y > 0) {
      up = spacesCount(board, x, y - 1, fill);
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
    if (state.board.food.length !== 0) {
      return state.board.food.map(food =>
        Object.assign({}, food, { dist: calculateDistance(state.you.body[0], food) })
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
    return Math.max(...state.board.snakes.filter(snake => !(snake.body[0].x === state.you.body[0].x && snake.body[0].y === state.you.body[0].y))
    .map(snake => snake.body.length))
  },

  determineMove: (initialPossibleMoves, possibleMoves, food) => {
    if (initialPossibleMoves.length === 1) {
      return initialPossibleMoves[Math.floor(Math.random() * initialPossibleMoves.length)]
    } else if (possibleMoves.length == 0) {
      if (stern > 0 && stern >= star && stern >= port && stern >= bow)
        return "down"
      else if (stern > 0 && bow >= star && bow >= port && bow >= stern)
        return "up"
      else if (stern > 0 && star >= bow && star >= port && star >= stern)
        return "right"
      else if (stern > 0 && port >= bow && port >= star && port >= stern)
        return "left"
      else
        return initialPossibleMoves[Math.floor(Math.random() * initialPossibleMoves.length)]
    } else if (possibleMoves.length == 1) {
      return possibleMoves[0]
    } else if (food) {
      const xDistance = (head, p) => { return p.x - head.x };
      const yDistance = (head, p) => { return p.y - head.y };

      if (possibleMoves.includes("right") && xDistance(state.you.body[0], food) > 0)
        return "right";
      else if (possibleMoves.includes("left") && xDistance(state.you.body[0], food) < 0)
        return "left";
      else if (possibleMoves.includes("down") && yDistance(state.you.body[0], food) > 0)
        return "down";
      else if (possibleMoves.includes("up") && yDistance(state.you.body[0], food) < 0)
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
