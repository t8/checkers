// const board = [
//   [9, 1, 9, 1, 9, 1, 9, 1],
//   [1, 9, 1, 9, 1, 9, 1, 9],
//   [9, 1, 9, 1, 9, 1, 9, 1],
//   [9, 9, 9, 9, 9, 9, 9, 9],
//   [9, 9, 9, 9, 9, 9, 9, 9],
//   [2, 9, 2, 9, 2, 9, 2, 9],
//   [9, 2, 9, 2, 9, 2, 9, 2],
//   [2, 9, 2, 9, 2, 9, 2, 9],
// ];

// let position = {
//   x: 0,
//   y: 1,
// };

// let newPosition = {
//   x: 1,
//   y: 2,
// };

export function handle(state, action) {
  if (action.input.function === "move") {
    // Validate position inputs
    const a = action.input.a;
    const b = action.input.b;
    if (!a.x || !a.y || !b.x || !b.y) {
      throw new ContractError("ERROR: Missing position");
    }
    const moveResult = move(state.board, a, b);

    if (
      !moveResult.valid ||
      moveResult.data === "Player 2 wins" ||
      moveResult.data === "Player 1 wins"
    ) {
      throw new ContractError(moveResult.data);
    } else {
      // Update board with new data
      state.board = moveResult.data;
    }
  } else if (action.input.function === "clear") {
    state.board = [
      [9, 1, 9, 1, 9, 1, 9, 1],
      [1, 9, 1, 9, 1, 9, 1, 9],
      [9, 1, 9, 1, 9, 1, 9, 1],
      [9, 9, 9, 9, 9, 9, 9, 9],
      [9, 9, 9, 9, 9, 9, 9, 9],
      [2, 9, 2, 9, 2, 9, 2, 9],
      [9, 2, 9, 2, 9, 2, 9, 2],
      [2, 9, 2, 9, 2, 9, 2, 9],
    ];
  }

  return { state };
}

function move(board, pos, newPos) {
  let selector = board[pos.y][pos.x];
  let move = board[newPos.y][newPos.x];
  let newBoard = board;

  const valid = validateMove(board, pos, newPos);

  if (!valid.valid) {
    return { valid: false, data: valid.msg };
  }

  // Check if somebody ate somebody
  if (selector + move === 3) {
    // Somebody ate somebody
    if (selector === 1) {
      // Player 1 ate Player 2
      newBoard[newPos.y][newPos.x] = 1;
    } else {
      // Player 2 ate Player 1
      newBoard[newPos.y][newPos.x] = 2;
    }
  } else {
    // Update board
    newBoard[newPos.y][newPos.x] = selector;
  }

  // Count number of pieces left on board
  let playerOnePieces = 0,
    playerTwoPieces = 0;
  for (let i = 0; i < newBoard.length; i++) {
    for (let x = 0; x < newBoard[i].length; x++) {
      if (newBoard[i][x] == 1) {
        // Player 1 piece
        playerOnePieces++;
      } else if (newBoard[i][x] == 2) {
        // Player 2 piece
        playerTwoPieces++;
      }
    }
  }

  // Check if anybody won
  if (playerOnePieces === 0 && playerTwoPieces !== 0) {
    // Player 2 wins
    return { valid: true, data: "Player 2 wins" };
  } else if (playerTwoPieces === 0 && playerOnePieces !== 0) {
    // Player 1 wins
    return { valid: true, data: "Player 1 wins" };
  }

  return { valid: true, data: newBoard };
}

function validateMove(board, pos, newPos) {
  let selector = board[pos.y][pos.x];
  let move = board[newPos.y][newPos.x];

  // Prevent selecting white space
  if (selector === 9) {
    return { valid: false, msg: "ERROR: Selected white space" };
  }

  // Validate board positions
  if (pos.x < 0 || pos.x > 7) {
    return { valid: false, msg: "ERROR: X position not on board" };
  }
  if (pos.y < 0 || pos.y > 7) {
    return { valid: false, msg: "ERROR: Y position not on board" };
  }
  if (newPos.x < 0 || newPos.x > 7) {
    return { valid: false, msg: "ERROR: Move X position not on board" };
  }
  if (newPos.y < 0 || newPos.y > 7) {
    return { valid: false, msg: "ERROR: Move Y position not on board" };
  }

  // Prevent moving in white space
  if (selector + move > 3) {
    return { valid: false, msg: "ERROR: Tried to move in invalid position" };
  }

  // Prevent moving non-diagonally
  if (pos.x === newPos.x) {
    return { valid: false, msg: "ERROR: Tried to move horizontally" };
  }
  if (pos.y === newPos.y) {
    return { valid: false, msg: "ERROR: Tried to move vertically" };
  }

  // Prevent moving more than 1 space diagonally
  if (Math.abs(pos.x - newPos.x) > 1 || Math.abs(pos.y - newPos.y) > 1) {
    return {
      valid: false,
      msg: "ERROR: Tried to move more than one space diagonally",
    };
  }

  // Prevent moving backwards
  if (selector === 1) {
    // Player 1
    if (newPos.y - pos.y < 0) {
      return { valid: false, msg: "ERROR: Tried to move backwards" };
    }
  } else {
    // Player 2
    if (newPos.y - pos.y > 0) {
      return { valid: false, msg: "ERROR: Tried to move backwards" };
    }
  }

  // Prevent moving over own occupied space
  if (selector + move === 2) {
    return { valid: false, msg: "ERROR: Player 1 tried to eat itself" };
  } else if (selector + move === 4) {
    return { valid: false, msg: "ERROR: Player 2 tried to eat itself" };
  }

  return { valid: true };
}
