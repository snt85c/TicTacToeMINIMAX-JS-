/**EXPLANATION: i create 3 object, on that deals with the board ,one for the methods for the player, and one for the AI. i initialize the objects and then i pass the object and his methods to the method that starts the game. MouseSelection get the player input and check for win, after that the game checks the level of difficutly we are playing and makes its move as well for checking for win. */
/*use strict*/
/**BOARD OBJECT includes methods to deal with the board */
const Board = () => {
  const boardArray = [];
  const overlay = document.getElementById("overlay");
  let winningIndexForHighlight = []; //will store the indexes of the winning row/columns/diagonals to highlight them

  /**get the difficulty level from the HTML Element */
  const difficulty = () => {
    const selectDifficulty = document.getElementById("difficulty");
    return selectDifficulty.value;
  };

  /** populate/reset the screen and the array with empty values, */
  const populateArray = function () {
    for (let i = 0; i < 9; i++) {
      boardArray[i] = document.getElementById(i).textContent = "";
      document.getElementById(i).style.color = "white"; //reset the color of the text of every cell to white, otherwise it will stay red after a win
    }
    updateContainer();
    overlay.style.display = "none";
  };

  /**refresh the container on screen with values from the array */
  const updateContainer = function () {
    for (let i = 0; i < 9; i++) {
      document.getElementById(i).textContent = boardArray[i];
    }
  };

  /**the button activates the funtion populateArray to clear the screen and the values in the array */
  const reset = document
    .getElementById("reset")
    .addEventListener("click", populateArray);

  /**check 036 or 147 or 258 for column win */
  const checkForColumnWin = function (sign) {
    if (
      boardArray[0] == sign &&
      boardArray[3] == sign &&
      boardArray[6] == sign
    ) {
      winningIndexForHighlight = [0, 3, 6]; //stores the indexes which are found all equals to the sign, so that they can be highlighted at gameover
      return true;
    } else if (
      boardArray[1] == sign &&
      boardArray[4] == sign &&
      boardArray[7] == sign
    ) {
      winningIndexForHighlight = [1, 4, 7];
      return true;
    } else if (
      boardArray[2] == sign &&
      boardArray[5] == sign &&
      boardArray[8] == sign
    ) {
      winningIndexForHighlight = [2, 5, 8];
      return true;
    }
  };

  /** check 012 or 345 or 678 for row win */
  const checkForRowWin = (sign) => {
    if (
      boardArray[0] == sign &&
      boardArray[1] == sign &&
      boardArray[2] == sign
    ) {
      winningIndexForHighlight = [0, 1, 2];
      return true;
    } else if (
      boardArray[3] == sign &&
      boardArray[4] == sign &&
      boardArray[5] == sign
    ) {
      winningIndexForHighlight = [3, 4, 5];
      return true;
    } else if (
      boardArray[6] == sign &&
      boardArray[7] == sign &&
      boardArray[8] == sign
    ) {
      winningIndexForHighlight = [6, 7, 8];
      return true;
    }
  };

  /**check two sets of cells for diagonal win */
  const checkForDiagonalWin = function (sign) {
    if (
      boardArray[0] == sign &&
      boardArray[4] == sign &&
      boardArray[8] == sign
    ) {
      winningIndexForHighlight = [0, 4, 8];
      return true;
    } else if (
      boardArray[2] == sign &&
      boardArray[4] == sign &&
      boardArray[6] == sign
    ) {
      winningIndexForHighlight = [2, 4, 6];
      return true;
    }
  };

  /**read the array in search for empty cells. if there are none, return true */
  const checkForDraw = () => {
    let count = 0;
    boardArray.forEach((cell) => {
      if (cell == "") count++;
    });
    return count == 0; //true if count == 0, otherwise false
  };

  /** checks 3 method for overall win, otherwise 1 method for draw- contains instructions on what to put on the overlay (win, lose, draw) */
  const checkWin = function (sign) {
    if (
      checkForColumnWin(sign) ||
      checkForRowWin(sign) ||
      checkForDiagonalWin(sign)
    ) {
      overlay.style.display = "flex";
      overlay.textContent = sign == "X" ? "YOU WIN" : "YOU LOSE";
      winningIndexForHighlight.forEach(
        (index) => (document.getElementById(index).style.color = "red")
      ); //change color of indexes
      return true;
    }
    if (checkForDraw()) {
      overlay.style.display = "flex";
      overlay.textContent = "DRAW";
      return true;
    }
  };

  return {
    populateArray,
    updateContainer,
    reset,
    checkWin,
    boardArray,
    difficulty,
    checkForColumnWin,
    checkForDiagonalWin,
    checkForRowWin,
    checkForDraw,
  };
};
/**END BOARD OBJECT ----------------------------------------*/

/**PLAYER OBJECT for AI and humand player */
const Player = (sign) => {
  const getSign = () => sign;

  /** add eventListener to document, checks if the target is a cell, its empty and we havent reached endgame , if it is, it adds the sign to the boardArray and updates the container. if this move is not a winnign move, the computer plays his random movement */
  const mouseSelection = (board) => {
    document.addEventListener("click", (e) => {
      if (
        e.target.textContent == "" &&
        e.target.className == "cell" &&
        !board.checkWin("O") &&
        !board.checkWin("X")
      ) {
        board.boardArray[e.target.id] = sign;
        board.updateContainer();
        if (!board.checkWin(sign)) {
          if (board.difficulty() === "Easy") {
            ai.easy("O", board);
          }
          if (board.difficulty() === "Medium") {
            ai.medium("O", board);
          }
          if (board.difficulty() === "Hard") {
            ai.hard("O", board);
          }
        }
      }
    });
  };

  return { mouseSelection, getSign };
};
/**END PLAYER OBJECT ----------------------------------------*/

/**AI OBJECT contains methods to play against the pc */
const AI = () => {
  const rows = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];
  /**used for the ai to check on column */
  const column = [
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
  ];
  /**used for the ai to check on diagonals */
  const diagonal = [
    [0, 4, 8],
    [2, 4, 6],
  ];
  /**returns a random nimber between 0 and 8 */
  const random = () => Math.floor(Math.random() * 9);

  /**creates a small delay between the human player selection and the computer selection */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**has to be kept in a for loop, as a while loop wont break out. does repeated random assignment until it finds an empty spot where it will asssign his sign. updates and checks if is a win condition */
  const easy = async (sign, board) => {
    for (let i = 0; i < 10; i++) {
      //a while loop wont work!
      let randomLocation = random();
      if (board.boardArray[randomLocation] == "") {
        board.boardArray[randomLocation] = sign;
        await sleep(300);
        board.updateContainer();
        board.checkWin(sign);
        break;
      }
    }
  };

  /**initialize temp as -1, ideally it will return the same value if nothing has been found. i cycle trough the array for row with the cooridnates of the container alreay set there and then counts if the cell contains X. if it does it increase the counter, if it doesnt, it stores the address in temp. if the counter has found 2 cells containing x on the row it is to be assumed that one is empty and temp has stored the value already, in that case it will return it to proceed with a counter move in the medium(). otherwise it resets the value of temp to -1 and read the next row. returns the value of temp at the end. */
  const checkRowsMediumDifficulty = (sign, board) => {
    let temp = -1;
    for (let i = 0; i < 3; i++) {
      let counter = 0;
      for (let j = 0; j < 3; j++) {
        if (board.boardArray[rows[i][j]] == "X") {
          counter++;
        }
        if (board.boardArray[rows[i][j]] == "") {
          temp = rows[i][j];
        }
        if (counter == 2 && temp != -1) {
          return temp;
        }
      }
      temp = -1;
    }
    return temp;
  };

  /**same logic as checkRowsMediumDifficulty */
  const checkColumnsMediumDifficulty = (sign, board) => {
    let temp = -1;
    for (let i = 0; i < 3; i++) {
      let counter = 0;
      for (let j = 0; j < 3; j++) {
        if (board.boardArray[column[i][j]] == "X") {
          counter++;
        }
        if (board.boardArray[column[i][j]] == "") {
          temp = column[i][j];
        }
        if (counter == 2 && temp != -1) {
          return temp;
        }
      }
      temp = -1;
    }
    return temp;
  };

  /**same logic as checkRowsMediumDifficulty */
  const checkDiagonalsMediumDifficulty = () => {
    let temp = -1;
    for (let i = 0; i < 2; i++) {
      let counter = 0;
      for (let j = 0; j < 3; j++) {
        if (board.boardArray[diagonal[i][j]] == "X") {
          counter++;
        }
        if (board.boardArray[diagonal[i][j]] == "") {
          temp = diagonal[i][j];
        }
        if (counter == 2 && temp != -1) {
          return temp;
        }
      }
      temp = -1;
    }
    return temp;
  };

  /**checks for 3 possible countermoves on rows columns and diagonals (the 3 methods will either pass a positive number(1-8) or -1 for not found, in that case it goes for a random move, otherwise update the container with the value and checks for win) */
  const medium = async (sign, board) => {
    let columnsValue = checkColumnsMediumDifficulty(sign, board);
    let rowsValue = checkRowsMediumDifficulty(sign, board);
    let diagonalValue = checkDiagonalsMediumDifficulty(sign, board);
    let temp = -1;
    if (columnsValue != -1) temp = columnsValue;
    if (rowsValue != -1) temp = rowsValue;
    if (diagonalValue != -1) temp = diagonalValue;

    if (temp == -1) {
      easy(sign, board);
    } else {
      board.boardArray[temp] = "O";
      await sleep(300);
      board.updateContainer();
      board.checkWin(sign);
    }
  };

  const hard = async (sign, board) => {
    let counterSign = "X"; //set an opposite sign
    let bestMove = -1; //set the coordinate for best move to neutral
    let bestValue = -100; //set the bestValue to an unreachable low number
    for (let index = 0; index < 9; index++) {
      //goes trough the entire board
      if (board.boardArray[index] == "") {
        //if cell is empty
        board.boardArray[index] = sign; //apply sign "O"
        let moveValue = miniMax(board, false, sign, counterSign); //execute minimax on the board with previous assignment, get a value on it
        board.boardArray[index] = ""; //remove the sign
        if (moveValue > bestValue) {
          //switch the best move witht he current one if it has a better value
          bestMove = index;
          bestValue = moveValue;
        }
      }
    }
    board.boardArray[bestMove] = sign; //optimal move has been found and assigned after cycling trought the entire board and do the minimax to each cell
    await sleep(300); //wait 0.3sec
    board.updateContainer(); //show on screen
    board.checkWin(sign); //let the player know if it's a game over
  };

  const miniMax = (board, isMaximizing, sign, counterSign) => {
    let boardVal = checkWinConditionsMiniMax(sign, counterSign, board); //after assignation, check if there is a win, returns +10, -10 or 0
    if (boardVal == 10 || boardVal == -10) {
      //base case to exit the recursion ahead
      return boardVal;
    }
    if (board.checkForDraw()) {
      return 0;
    }
    if (isMaximizing) {
      let highestVal = -100;
      for (let index = 0; index < 9; index++) {
        if (board.boardArray[index] == "") {
          board.boardArray[index] = sign;
          highestVal = Math.max(
            highestVal,
            miniMax(board, !isMaximizing, sign, counterSign)
          );
          //RECURSION:
          board.boardArray[index] = ""; //remove the sign
        }
      }
      return highestVal;
    } else {
      let lowestVal = +100;
      for (let index = 0; index < 9; index++) {
        if (board.boardArray[index] == "") {
          board.boardArray[index] = counterSign;
          lowestVal = Math.min(
            lowestVal,
            miniMax(board, !isMaximizing, sign, counterSign)
          );
          board.boardArray[index] = "";
        }
      }
      return lowestVal;
    }
  };

  const checkWinConditionsMiniMax = (sign, counterSign, board) => {
    if (
      board.checkForColumnWin(sign) ||
      board.checkForRowWin(sign) ||
      board.checkForDiagonalWin(sign)
    ) {
      return 10;
    }
    if (
      board.checkForColumnWin(counterSign) ||
      board.checkForRowWin(counterSign) ||
      board.checkForDiagonalWin(counterSign)
    ) {
      return -10;
    }
    return 0;
  };

  return { easy, medium, hard };
};
/**END AI OBJECT ---------------------------------------- */

const board = Board();
const p1 = Player("X");
const ai = AI();

board.populateArray();
p1.mouseSelection(board, ai);
