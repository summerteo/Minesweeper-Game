const SIZE = 10
const BOMBS = 20

const main = document.getElementById('main')
const flagNum = document.getElementById('flag-num')
const timer = document.getElementById('timer')
const reloadBtn = document.getElementById('reload-btn')
let isFirstClick = true
var setTimerInterval

startGame()

function startGame() {
    main.innerHTML = ''
    isFirstClick = true
    generateTemplate()
}

reloadBtn.addEventListener('click', () => {
    startGame()
})

function generateTemplate() {
    for (let x = 0; x < SIZE; x++) {
        const rowEl = document.createElement('div')

        rowEl.classList.add('row')

        main.appendChild(rowEl)

        for (let y = 0; y < SIZE; y++) {
            const boxEl = document.createElement('div')

            boxEl.classList.add('box')

            boxEl.addEventListener('click', () => {
                if (isFirstClick) {

                    // Timer
                    var startTime = Date.now();
                    setTimerInterval = setInterval(function () {
                        var delta = Math.floor(Math.abs(Date.now() - startTime) / 1000);

                        // Find minutes
                        var minutes = Math.floor(delta / 60) % 60;
                        delta -= minutes * 60;

                        // Find seconds
                        var seconds = delta % 60;

                        minutes = minutes.toString()
                        seconds = seconds.toString()
                        let usedTime = (minutes.length < 2 ? "0" + minutes : minutes) + ":" + (seconds.length < 2 ? "0" + seconds : seconds)
                        timer.children[1].textContent = usedTime

                    }, 1000);

                    // Clear all the flags
                    const flagBoxes = document.querySelectorAll('.box[class~="flag"]')
                    flagBoxes.forEach((box) => {
                        box.classList.remove('flag')
                    })

                    generateBombs(x + 1, y + 1)
                    initBombNumbers()
                    initBoxesOpened(x + 1, y + 1)
                    isFirstClick = false
                } else {
                    if (!boxEl.classList.contains('flag')) {
                        boxEl.classList.add('box-open')
                        boxEl.firstChild.style.display = 'block'
                        numberColors(boxEl, boxEl.firstChild.textContent)

                        if (boxEl.firstChild.textContent == 0) initBoxesOpened(x + 1, y + 1)

                        if (boxEl.classList.contains('bomb')) {
                            alert('You lost!')
                            gameOver()
                        }
                        else checkFinishGame()
                    }
                }
            })

            boxEl.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                const addFlag = boxEl.classList.toggle('flag')

                let flagInt = parseInt(flagNum.children[1].textContent)

                initFlagNum(addFlag ? flagInt - 1 : flagInt + 1)

                checkFinishGame()
            })

            rowEl.appendChild(boxEl)
        }
    }
}

function generateBombs(rowIdx, boxIdx) {

    initFlagNum(BOMBS)

    for (let x = 0; x < BOMBS; x++) {

        while (true) {
            const randomRow = Math.floor(Math.random() * SIZE) + 1;
            const randomBox = Math.floor(Math.random() * SIZE) + 1;

            if (randomRow < rowIdx - 1 || randomRow > rowIdx + 1 || randomBox < boxIdx - 1 || randomBox > boxIdx + 1) {
                let selectors = 'div.row:nth-child(' + randomRow + ')>div.box:nth-child(' + randomBox + ')'

                const box = document.querySelector(selectors)

                // Prevent duplicate bombs
                if (!box.classList.contains('bomb')) {
                    box.classList.add('bomb')
                    break
                }
            }
        }
    }
}

function findBoxesAround(rowIdx, boxIdx) {
    // Find the boxes around
    let boxesAround = []
    for (let x = rowIdx - 1; x <= rowIdx + 1; x++) {

        // Skip first and last row 
        if (x < 1 || x > SIZE) continue

        for (let y = boxIdx - 1; y <= boxIdx + 1; y++) {

            // Skip first and last column
            if (y < 1 || y > SIZE) continue

            // Exclude own box, else push the x,y index to array
            if (x != rowIdx || y != boxIdx) boxesAround.push({ row: x, box: y })
        }
    }
    return boxesAround
}

function initBombNumbers() {

    // Get all rows
    const rows = document.querySelectorAll('.row')

    for (let rowIdx = 1; rowIdx <= rows.length; rowIdx++) {

        // Get all boxes in each row
        const boxes = document.querySelectorAll('.row:nth-child(' + rowIdx + ')>.box')

        for (let boxIdx = 1; boxIdx <= boxes.length; boxIdx++) {
            const box = boxes[boxIdx - 1];

            const boxSpan = document.createElement('span')
            boxSpan.style.display = 'none'

            if (!box.classList.contains('bomb')) {
                // Find the boxes around
                let boxesAround = findBoxesAround(rowIdx, boxIdx)

                // Find total bombs around
                let totalBombsAround = 0
                for (let z = 0; z < boxesAround.length; z++) {
                    const element = boxesAround[z];

                    let selectors = 'div.row:nth-child(' + element.row + ')>div.box:nth-child(' + element.box + ')'

                    const boxAround = document.querySelector(selectors)

                    if (boxAround.classList.contains('bomb')) totalBombsAround++
                }
                boxSpan.textContent = totalBombsAround
            } else boxSpan.innerHTML="<i class='fa fa-bomb'></i>"

            box.appendChild(boxSpan)
        }
    }
}

function initBoxesOpened(rowIdx, boxIdx) {
    // Find the boxes around
    let boxesAround = [{ row: rowIdx, box: boxIdx }]
    boxesAround.push(...findBoxesAround(rowIdx, boxIdx))

    for (let z = 0; z < boxesAround.length; z++) {
        const element = boxesAround[z];

        let selectors = 'div.row:nth-child(' + element.row + ')>div.box:nth-child(' + element.box + ')'

        const boxAround = document.querySelector(selectors)

        if (!boxAround.classList.contains('box-open')) {

            boxAround.classList.add('box-open')
            boxAround.classList.remove('flag')
            boxAround.firstChild.style.display = 'block'
            numberColors(boxAround, boxAround.firstChild.textContent)

            if ((element.row != rowIdx || element.box != boxIdx) && boxAround.firstChild.textContent == 0) initBoxesOpened(element.row, element.box)
        }

    }
}

function initFlagNum(flags) {
    let flagStr = flags.toString()
    while (true) {
        if (flagStr[0] == "-" && flagStr.length < 4) flagStr = flagStr.slice(0, 1) + "0" + flagStr.slice(1);
        else if (flagStr.length < 3) flagStr = "0" + flagStr
        else break
    }
    flagNum.children[1].textContent = flagStr
}

function numberColors(boxEl, number) {
    switch (number) {
        case "0":
            boxEl.style.backgroundColor = "#ccddee"
            boxEl.firstChild.style.color = "transparent"
            break;
        case "1":
            boxEl.style.backgroundColor = "#22ccee"
            boxEl.style.boxShadow = "0 3px 0 #0095db"
            boxEl.firstChild.style.color = "#88dded"
            break;
        case "2":
            boxEl.style.backgroundColor = "#ffdd43"
            boxEl.style.boxShadow = "0 3px 0 #ff9833"
            boxEl.firstChild.style.color = "#ffff66"
            break;
        case "3":
            boxEl.style.backgroundColor = "#fb4499"
            boxEl.style.boxShadow = "0 3px 0 #e3117e"
            boxEl.firstChild.style.color = "#fe66ba"
            break;
        case "4":
            boxEl.style.backgroundColor = "#445576"
            boxEl.style.boxShadow = "0 3px 0 #32334b"
            boxEl.firstChild.style.color = "#ccddee"
            break;
        case "":
            break;
        default: // 5,6,7
            boxEl.style.backgroundColor = "#eb8cc1"
            boxEl.style.boxShadow = "0 3px 0 #bc709a"
            boxEl.firstChild.style.color = "#f7d1e6"
            break;
    }
}

function checkFinishGame() {
    const boxes = document.querySelectorAll('.box')

    let finishBoxes = 0
    for (let x = 0; x < boxes.length; x++) {
        const box = boxes[x];
        if (box.classList.contains('box-open') || (box.classList.contains('bomb') && box.classList.contains('flag'))) finishBoxes++
    }

    if (finishBoxes == SIZE * SIZE) {
        alert('You win!')
        gameOver()
    }
}

function gameOver() {
    clearInterval(setTimerInterval)

    const boxes = document.querySelectorAll('.box')

    for (let x = 0; x < boxes.length; x++) {
        const box = boxes[x];

        if (!box.classList.contains('flag') || !box.classList.contains('bomb')) {
            box.classList.add('box-open')
            box.firstChild.style.display = 'block'
            numberColors(box, box.firstChild.textContent)
        }
        if (box.classList.contains('flag') && !box.classList.contains('bomb')) box.classList.remove('flag')

    }
}