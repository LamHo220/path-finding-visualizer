import { rand, changeClassName, isHorizontalCut, delay } from "../misc/misc";

var deltaTime = 60;

const RecursiveDivisionMaze = async (grid, maxRow, maxCol, duration) => {
  deltaTime = duration;
  doRecuresiveDivision(
    grid,
    1,
    1,
    maxRow - 2,
    maxCol - 2,
    isHorizontalCut(maxCol, maxRow)
  );
};
const doRecuresiveDivision = async (
  grid,
  fromRow,
  fromCol,
  toRow,
  toCol,
  isHorizontal
) => {
  if (isHorizontal) {
    if (toCol - fromCol < 2) {
      return;
    }
    const wallRow = Math.floor(rand(fromRow + 1, toRow - 1) / 2) * 2;
    await horizontalCut(grid, fromCol, toCol, wallRow);
    await doRecuresiveDivision(
      grid,
      fromRow,
      fromCol,
      wallRow - 1,
      toCol,
      isHorizontalCut(toCol - fromCol, wallRow - 1 - fromRow)
    );
    await doRecuresiveDivision(
      grid,
      wallRow + 1,
      fromCol,
      toRow,
      toCol,
      isHorizontalCut(toCol - fromCol, toRow - wallRow - 1)
    );
  } else {
    if (toRow - fromRow < 2) {
      return;
    }

    const wallCol = Math.floor(rand(fromCol + 1, toCol - 1) / 2) * 2;
    await verticalCut(grid, fromRow, toRow, wallCol);
    await doRecuresiveDivision(
      grid,
      fromRow,
      fromCol,
      toRow,
      wallCol - 1,
      isHorizontalCut(wallCol - 1 - fromCol, toRow - fromRow)
    );
    await doRecuresiveDivision(
      grid,
      fromRow,
      wallCol + 1,
      toRow,
      toCol,
      isHorizontalCut(toCol - wallCol - 1, toRow - fromRow)
    );
  }
};

const horizontalCut = async (grid, fromCol, toCol, wallRow) => {
  const passCol = Math.floor(rand(fromCol, toCol) / 2) * 2 + 1;

  for (let i = fromCol; i <= toCol; ++i) {
    if (i !== passCol) {
      let node = grid[wallRow][i];
      if (!(node.isStart || node.isEnd)) {
        grid[wallRow][i].isWall = true;
        changeClassName(node);
      }
    }
    await delay(deltaTime);
  }
};

const verticalCut = async (grid, fromRow, toRow, wallCol) => {
  const passRow = Math.floor(rand(fromRow, toRow) / 2) * 2 + 1;

  for (let i = fromRow; i <= toRow; ++i) {
    if (i !== passRow) {
      let node = grid[i][wallCol];
      if (!(node.isStart || node.isEnd)) {
        grid[i][wallCol].isWall = true;
        changeClassName(node);
      }
    }
    await delay(deltaTime);
  }
};

export default RecursiveDivisionMaze;
