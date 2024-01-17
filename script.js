document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const gridSize = 15;
    const totalMines = 35;
    let menuCell;
    let openMenu;
    let firstClick = true;

    function createGrid() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell', 'land');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', showMenu);
                cell.addEventListener('contextmenu', handleContextMenu);
                gameContainer.appendChild(cell);
            }
        }
        placeMines();
    }

    function placeMines() {
        const cells = document.querySelectorAll('.cell');
        const mineIndexes = generateMineIndexes(totalMines, gridSize * gridSize);

        mineIndexes.forEach(index => {
            cells[index].classList.add('mine');
        });
    }

    function showMenu(event) {
        event.preventDefault();
        const clickedCell = event.target;
        const isSameCell = clickedCell === menuCell;
    
        if (!isSameCell && openMenu) {
            const closeBtn = openMenu.querySelector('.menu-option.x');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    
        if (!isSameCell) {
            menuCell = clickedCell;
            const menu = createMenu();
            clickedCell.appendChild(menu);
            menu.style.display = 'flex';
            openMenu = menu;
    
            if (firstClick) {
                firstClick = false;
                cascadeReveal(clickedCell);
            } else {
                clickedCell.removeEventListener('click', showMenu);
            }
    
            updateLiveRevealedCells();
    
            menu.addEventListener('click', () => clickedCell.addEventListener('click', showMenu));
        }
    }

    function handleContextMenu(event) {
        event.preventDefault();
    }

    function createMenu() {
        const menu = document.createElement('div');
        menu.classList.add('menu');

        const flagOption = createMenuOption('Flag', toggleFlag, 'flag', 'lightblue');
        const digOption = createMenuOption('Dig', digCell, 'dig', '#d2b48c');
        const xOption = createMenuOption('X', closeMenu, 'x', 'lightcoral');

        menu.appendChild(flagOption);
        menu.appendChild(digOption);
        menu.appendChild(xOption);

        return menu;
    }

    function createMenuOption(text, action, optionClass, hoverColor) {
        const option = document.createElement('div');
        option.classList.add('menu-option', optionClass);
        option.textContent = text;
        option.addEventListener('click', action);

        option.addEventListener('mouseover', () => option.style.backgroundColor = hoverColor || 'white');
        option.addEventListener('mouseout', () => option.style.backgroundColor = 'lightgray');

        return option;
    }

    function toggleFlag() {
        menuCell.classList.toggle('flag');
        const flagText = menuCell.querySelector('.flag-text');

        if (!flagText) {
            const flagText = document.createElement('span');
            flagText.classList.add('flag-text');
            flagText.textContent = 'Flag';
            menuCell.appendChild(flagText);
        } else {
            flagText.remove();
        }

        hideMenu(openMenu);
    }

    function digCell() {
        const clickedCell = menuCell;
        if (clickedCell.classList.contains('mine')) {
            revealMines();
            clickedCell.classList.add('clicked');
            // Add a delay for the red screen effect
            setTimeout(() => {
                document.body.style.transition = 'background-color 1s';
                document.body.style.backgroundColor = 'red';
            }, 500);
            // Refresh the page after the red screen effect
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            cascadeReveal(clickedCell);
            clickedCell.removeEventListener('click', showMenu);
        }
        hideMenu(openMenu);
    }

    function closeMenu() {
        hideMenu(openMenu);
    }

    function hideMenu(menu) {
        if (menu) {
            menu.style.display = 'none';
            menu.remove();
            openMenu = null;
        }
    }

    function revealMines() {
        const mineCells = document.querySelectorAll('.mine');
        mineCells.forEach(cell => cell.classList.add('clicked'));
    }

    function resetGame() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('mine', 'revealed', 'flag', 'clicked');
            cell.textContent = '';
        });
        placeMines();
        firstClick = true;
    }

    function cascadeReveal(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const index = row * gridSize + col;
        const cells = document.querySelectorAll('.cell');
        const mineCount = countAdjacentMines(row, col);

        if (!cell.classList.contains('revealed')) {
            cell.classList.add('revealed', 'land');

            const neighbors = getNeighbors(row, col);
            const unrevealedNeighbor = neighbors.some(neighbor => {
                const neighborCell = document.querySelector(`.cell[data-row="${neighbor.row}"][data-col="${neighbor.col}"]`);
                return !neighborCell.classList.contains('revealed');
            });

            if (unrevealedNeighbor) {
                cell.textContent = mineCount > 0 ? mineCount : '';
            } else {
                cell.textContent = '';
            }

            if (mineCount === 0) {
                neighbors.forEach(neighbor => {
                    const neighborIndex = neighbor.row * gridSize + neighbor.col;
                    const neighborCell = cells[neighborIndex];

                    if (!neighborCell.classList.contains('revealed') && !neighborCell.classList.contains('mine')) {
                        setTimeout(() => cascadeReveal(neighborCell), 50);
                    }
                });
            }
        }
    }

    function updateLiveRevealedCells() {
        const cells = document.querySelectorAll('.cell.revealed.land');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const mineCount = countAdjacentMines(row, col);
            const neighbors = getNeighbors(row, col);

            const unrevealedNeighbor = neighbors.some(neighbor => {
                const neighborCell = document.querySelector(`.cell[data-row="${neighbor.row}"][data-col="${neighbor.col}"]`);
                return !neighborCell.classList.contains('revealed');
            });

            if (unrevealedNeighbor) {
                cell.textContent = mineCount > 0 ? mineCount : '';
            } else {
                cell.textContent = '';
            }
        });
    }

    function countAdjacentMines(row, col) {
        const neighbors = getNeighbors(row, col);
        const cells = document.querySelectorAll('.cell');
        let count = 0;

        neighbors.forEach(neighbor => {
            const neighborIndex = neighbor.row * gridSize + neighbor.col;
            const neighborCell = cells[neighborIndex];

            if (neighborCell.classList.contains('mine')) {
                count++;
            }
        });

        return count;
    }

    function getNeighbors(row, col) {
        const neighbors = [];
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < gridSize && j >= 0 && j < gridSize && !(i === row && j === col)) {
                    neighbors.push({ row: i, col: j });
                }
            }
        }
        return neighbors;
    }

    function generateMineIndexes(numMines, totalCells) {
        const indexes = [];
        while (indexes.length < numMines) {
            const randomIndex = Math.floor(Math.random() * totalCells);
            if (!indexes.includes(randomIndex)) {
                indexes.push(randomIndex);
            }
        }
        return indexes;
    }

    createGrid();
});
