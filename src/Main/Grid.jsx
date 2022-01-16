import React, { useState, useEffect } from "react";
import Node from "./Node";
import { changeClassName,  refresh, delay, clearPath } from "./misc/misc";
import { Box } from "@mui/system";
import utilities from "./misc/utilities";

const Grid = (props) => {
  const style = getComputedStyle(document.body);
  const [maxRow, setMaxRow] = useState(
    parseInt(style.getPropertyValue("--max-row"))
  );
  const [maxCol, setMaxCol] = useState(
    parseInt(style.getPropertyValue("--max-col"))
  );
  const [startRow, setStartRow] = useState(
    parseInt(style.getPropertyValue("--node-start-row"))
  );
  const [startCol, setStartCol] = useState(
    parseInt(style.getPropertyValue("--node-start-col"))
  );
  const [endRow, setEndRow] = useState(
    parseInt(style.getPropertyValue("--node-end-row"))
  );
  const [endCol, setEndCol] = useState(
    parseInt(style.getPropertyValue("--node-end-col"))
  );
  const [grid, setGrid] = useState([]);
  const [prev, setPrev] = useState(null);
  const [visualized, setVisualized] = useState(false);

  const {
    allowDiagonal,
    heuristic,
    algorithm,
    setSteps,
    setPathLength,
    timeRatio,
    start,
    startMaze,
    setStart,
    setStartMaze,
    pattern,
    darkMode
  } = props;

  const createNode = (row, col) => {
    return {
      col: col,
      row: row,
      isStart: row === startRow && col === startCol,
      isEnd: row === endRow && col === endCol,
      isWall: false,
      previous: null,
      g: Infinity,
      h: utilities.getHeuristic(
        heuristic,
        Math.abs(row - endRow),
        Math.abs(col - endCol)
      ),
      f: Infinity,
      neighbors: [],
      weight: 1,
      idx: -1,
    };
  };

  const handleMouseDown = (event, row, col) => {
    let initNode = grid[row][col];
    if (!(initNode.isStart || initNode.isEnd)) {
      event = event || window.event;
      event.preventDefault();
      switch (event.buttons ) {
        case 1:
          const isWall = initNode.isWall;
          setPrev(!isWall);
          initNode.isWall = !isWall;
          changeClassName(darkMode, initNode);
          break;
        default:
          break;
      }
      
    } else {
      setPrev(initNode);
    }
  };

  const handleMouseEnter = (event, row, col) => {
    event = event || window.event;
    event.preventDefault();
    const node = grid[row][col];
    if (!(node.isStart || node.isEnd) && !node.isWall === prev) {
      event = event || window.event;
      event.preventDefault();
      switch (event.buttons ) {
        case 1:
          node.isWall = prev;
          changeClassName(darkMode, node);
          break;
        case 2:

          break;
        default:
          break;
      }
    } else if (node.isWall === prev) {
      // pass
    } else if (node.isStart || node.isEnd) {
      // pass
    } else if (prev !== null && !node.isWall) {
      // swap two node
      switch (event.buttons ) {
        case 1:
          node.isStart = prev.isStart;
          node.isEnd = prev.isEnd;
          prev.isStart = false;
          prev.isEnd = false;
          if (node.isStart) {
            setStartRow(row);
            setStartCol(col);
          }
          if (node.isEnd) {
            setEndRow(row);
            setEndCol(col);
          }
          setPrev(node);
          break;
        
        default:
          break;
      }
    }
  };

  const handleMouseUp = (row, col) => {
    if (grid[row][col].isStart) {
      setStartCol(col);
      setStartRow(row);
    }
    if (grid[row][col].isEnd) {
      setEndCol(col);
      setEndRow(row);
    }
    setGrid(grid.slice());
    setPrev(null);
  };

  // initialize the grid
  useEffect(() => {
    let nodes = [];
    for (let row = 0; row < maxRow; ++row) {
      const cur = [];
      for (let col = 0; col < maxCol; ++col) {
        cur.push(createNode(row, col));
      }
      nodes.push(cur);
    }
    setGrid(setNeightbours(nodes));
  }, []);

  const setNeightbours = (nodes) => {
    for (let row = 0; row < maxRow; ++row) {
      for (let col = 0; col < maxCol; ++col) {
        nodes[row][col].neighbors = [];
        let neighbors = nodes[row][col].neighbors;
        // up
        if (row - 1 >= 0) neighbors.push(nodes[row - 1][col]);
        // down
        if (row + 1 < maxRow) neighbors.push(nodes[row + 1][col]);
        // left
        if (col - 1 >= 0) neighbors.push(nodes[row][col - 1]);
        // right
        if (col + 1 < maxCol) neighbors.push(nodes[row][col + 1]);
        // diagonal
        if (allowDiagonal) {
          // up left
          if (row - 1 >= 0 && col - 1 >= 0)
            neighbors.push(nodes[row - 1][col - 1]);
          // down right
          if (row + 1 < maxRow && col + 1 < maxCol)
            neighbors.push(nodes[row + 1][col + 1]);
          // down left
          if (row + 1 < maxRow && col - 1 >= 0)
            neighbors.push(nodes[row + 1][col - 1]);
          // up right
          if (row - 1 >= 0 && col + 1 < maxCol)
            neighbors.push(nodes[row - 1][col + 1]);
        }
      }
    }
    return nodes;
  };

  useEffect(() => {
    if (grid != 0) {
      setGrid(setNeightbours(grid));
    }
  }, [props.allowDiagonal]);

  const updateHeuristic = (nodes) => {
    if (nodes === undefined) {
      return [];
    }
    for (let row of nodes) {
      for (let node of row) {
        node.g = Infinity;
        node.f = Infinity;
        const dx = Math.abs(node.col - endCol);
        const dy = Math.abs(node.row - endRow);
        node.h = utilities.getHeuristic(heuristic, dx, dy);
        node.previous = null;
      }
    }
    return nodes;
  };

  useEffect(() => {
    if (grid.length !== 0) {
      setGrid(updateHeuristic(grid));
    }
  }, [heuristic]);

  useEffect(async () => {
    if (start) {
      setPathLength(0);
      setSteps(0);
      await clearPath(darkMode,grid);
      const startNode = grid[startRow][startCol];
      const endNode = grid[endRow][endCol];
      let res = utilities.getAlgoResult(algorithm, startNode, endNode);
      // visualize visited nodes
      const n = res.visitedNodes.length;
      for (let i = 0; i < n; ++i) {
        const node = res.visitedNodes[i];
        if (!(node.isStart || node.isEnd)) {
          changeClassName(darkMode, node, (!darkMode?"bg-cyan-300":"bg-cyan-700")+" fade-in");
        }
        setSteps(i);
        await delay(20 * timeRatio);
      }
      // visualize shortest path
      const m = res.shortestPath.length;
      for (let i = 0; i < m; ++i) {
        const node = res.shortestPath[i];
        if (!(node.isStart || node.isEnd)) {
          changeClassName(darkMode, node, (!darkMode?"bg-yellow-300":"bg-yellow-600")+" fade-in");
        }
        setPathLength(i);
        await delay(20 * timeRatio);
      }
      await delay(20 * timeRatio);
      setVisualized(true);
      setStart();
    }
  }, [start]);

  useEffect(() => {
    updateHeuristic(grid);
    if (visualized) {
      clearPath(darkMode,grid);
      const startNode = grid[startRow][startCol];
      const endNode = grid[endRow][endCol];
      let res = utilities.getAlgoResult(algorithm, startNode, endNode);
      refresh(darkMode, res.visitedNodes, res.shortestPath);
      setPathLength(res.shortestPath.length);
      setSteps(res.visitedNodes.length);
    }
  }, [grid]);

  useEffect(async () => {
    setVisualized(false);
    if (grid.length !== 0 && startMaze) {
      const start = grid[startRow][startCol];
      const end = grid[endRow][endCol];
      await utilities.generatePattern(
        darkMode,
        pattern,
        grid,
        maxRow,
        maxCol,
        start,
        end,
        10 * timeRatio,
        0.3
      );
      setStartMaze();
    }
  }, [startMaze]);

  const handleContextMenu = (event) => {
    event.preventDefault();
  };


  return (
    <div onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
      <Box 
        display="grid"
        gridTemplateColumns={`repeat(${maxCol}, 3vh)`}
        gridTemplateRows={`repeat(${maxRow}, 3vh)`}
      >
        {grid.map((row, y) => {
          return row.map((node, x) => {
            const { isStart, isEnd, isWall } = node;
            return (
              <Node
                dark={darkMode}
                row={y}
                col={x}
                isWall={isWall}
                isStart={isStart}
                isEnd={isEnd}
                id={y + "-" + x}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseUp={handleMouseUp}
              />
            );
          });
        })}
      </Box>
    </div>
  );
};

export default Grid;
