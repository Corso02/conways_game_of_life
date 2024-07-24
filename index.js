class Tile{
    constructor(active = false){
        this.active = active
        this.element = document.createElement("a")
        this.element.addEventListener("click", () => this.changeState())
        this.shouldDie = false
        this.shouldAlive = false
        this.run = false
    }
    changeState(){
        this.active = !this.active
        this.setColor()
    }
    getState(){
        return this.active
    }
    getElement(){
        return this.element
    }
    setColor(){
        if(this.active){
            this.element.style.backgroundColor = "yellow"
        }
        else{
            this.element.style.backgroundColor = "gray"
        }
    }
    reset(){
        this.shouldAlive = false
        this.shouldDie = false    
        this.active = false
        this.setColor()
    }
    update(){
        if(this.shouldAlive) this.active = true
        if(this.shouldDie) this.active = false
        this.shouldAlive = false
        this.shouldDie = false
        this.setColor()
    }
}

class Board{
    constructor(height, width){
        this.height = height
        this.width = width
        this.board = Array.from({length: height}, (_, row) => Array.from({length: width}, (_, col) => new Tile()))
        this.wrapper = document.getElementsByClassName("game_board")[0]
        this.wrapper.style["grid-template-columns"] = `repeat(${width}, auto)`
        this.wrapper.style["grid-template-rows"] = `repeat(${height}, auto)`
        this.delayTime = 500
        this.initialBoard = null
    }
    render(){
        for(let row of this.board){
            for(let cell of row){
                this.wrapper.appendChild(cell.getElement())
            }
        }
    }
    reset(){
        if(this.run) this.run = false
        this.copy(false)
        this.wrapper.innerHTML = ""
        this.render()
        this.updateCells()
    }
    async play(){
        if(this.checkForActiveCells() && !this.run){
            this.copy(true)
            this.run = true
            while(this.run){
                await this.delay()
                this.oneStep()
            }
        }
        
    }
    stop(){
        console.log("STOP")
        this.run = false
    }
    oneStep(){
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                let aliveNeighbours = this.getNumberOfAliveNeighbours(i, j)
                if(aliveNeighbours < 2 || aliveNeighbours > 3) this.board[i][j].shouldDie = true
                else if(aliveNeighbours === 3 && !this.board[i][j].getState()) this.board[i][j].shouldAlive = true
                else{
                    this.board[i][j].shouldDie = false
                    this.board[i][j].shouldAlive = false
                }
            }
        }
        this.updateCells()
    }
    getNumberOfAliveNeighbours(row, col){
        let topRow = row - 1 === -1 ? 0 : row - 1
        let leftCol = col - 1 === - 1 ? 0 : col - 1
        let maxRow = row + 1 == this.height ? this.height - 1 : row + 1
        let maxCol =  col + 1 === this.width ? this.width - 1 : col + 1
        let count = 0
        for(let i = topRow; i <= maxRow; i++){
            for(let j = leftCol; j <= maxCol; j++){
                if(row === i && col === j) continue
                if(this.board[i][j].getState()) count++
            }
        }
        return count
    }
    updateCells(){
        for(let row of this.board){
            for(let cell of row){
                cell.update()
            }
        }
    }
    delay(){
        console.log(this.delayTime)
        return new Promise((resolve) => setTimeout(resolve, this.delayTime));
    }
    setDelayTime(time){
        if(time === 0) this.delayTime = 5000        
        else this.delayTime = (5000 - (time * 50))
    }
    importBoard(newBoard){
        this.stop()
        this.wrapper.innerHTML = ""
        let newB = JSON.parse(newBoard)
        
        this.width = newB.width
        this.height = newB.height
        this.board = Array.from({length: this.height}, (_, row) => Array.from({length: this.width}, (_, col) => new Tile(newB.board[row][col].active)))
        
        this.wrapper.style["grid-template-columns"] = `repeat(${this.width}, auto)`
        this.wrapper.style["grid-template-rows"] = `repeat(${this.height}, auto)`

        this.render()
        this.updateCells()
    }
    exportBoard(){
        this.stop()
        let tmpEl = document.createElement("a")
        tmpEl.setAttribute("href", `data:text/plain;charset=utf-8,${JSON.stringify(this)}`)
        tmpEl.setAttribute("download", "board")
        tmpEl.click()
    }
    checkForActiveCells(){
        for(let row of this.board){
            for(let cell of row){
                if(cell.active) return true
            }
        }
        return false
    }
    copy(create){
        /*
            if create is true current board is copied into initialBoard, otherwise initialBoard is copied into current board
        */
        if(this.initialBoard != null && !create){
            this.board = this.initialBoard.map(row => row.map(cell => new Tile(cell.active)))
        }
        if(create){
            this.initialBoard = this.board.map(row => row.map(cell => new Tile(cell.active)))
        }
    }
    clear(){
         for(let row of this.board){
            for(let cell of row){
                cell.reset()
            }
        }
    }
}

async function importFile(boardRef){
    const {value: file} = await Swal.fire({
        title: "Input file",
        input: "file",
        inputAttributes: {
            "accept": "txt/*",
            "aria-label": "Text file containing board data"
        }
    })
    if(file){
        const reader = new FileReader()
        reader.onload = (e) => {
            boardRef.importBoard(e.target.result)
        }
        reader.readAsText(file)
    }
}

function importPrefab(){
    document.getElementsByClassName("backdrop")[0].style.display = "block"
}

function generateLexicon(boardRef){
    function generateLexiconItem(title, imgSrc, levelSource){
        let wrapper = document.createElement("div")
        wrapper.setAttribute("class", "lexicon-item")

        let header = document.createElement("div")
        header.setAttribute("class", "lexicon-item-header")
        let headerText = document.createElement("p")
        headerText.setAttribute("class", "lexicon-item-text")
        headerText.innerHTML = title
        header.appendChild(headerText)
        

        let img = document.createElement("img")
        img.setAttribute("class", "lexicon-item-img")
        img.setAttribute("src", `./imgs/${imgSrc}`)

        let btn = document.createElement("button")
        btn.setAttribute("class", "button")
        btn.innerHTML = "Use"
        btn.addEventListener("click", () => {
            document.getElementsByClassName("backdrop")[0].style.display = "none"
            boardRef.importBoard(levelSource)
        })

        wrapper.appendChild(header)
        wrapper.appendChild(img)
        wrapper.appendChild(btn)
        return wrapper
    }

    let levelKeys = Object.keys(levels)
    let lexicon = document.getElementsByClassName("lexicon")[0]
    for(let key of levelKeys){
        lexicon.appendChild(generateLexiconItem(levels[key].levelName, levels[key].imageName, levels[key].level))
    }
}


let board = new Board(30, 76)
board.render()
document.getElementById("reset").addEventListener("click", () => board.reset())
document.getElementById("play").addEventListener("click", () => board.play())
document.getElementById("stop").addEventListener("click", () => board.stop())
document.getElementById("speed").addEventListener("change", (e) => board.setDelayTime(e.target.value))
document.getElementById("export").addEventListener("click", () => board.exportBoard())
document.getElementById("import").addEventListener("click", () => importFile(board))
document.getElementById("prefab").addEventListener("click", () => importPrefab(board))
document.getElementsByClassName("backdrop")[0].addEventListener("click", (e) => {
    if(e.target.className === "backdrop") e.target.style.display = "none"
})
document.getElementById("clear").addEventListener("click", () => board.clear())

generateLexicon(board)
