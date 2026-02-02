

const GLOBAL_CELL_SIZE_X = 16;
const GLOBAL_CELL_SIZE_Y = 16;
const INPUT_COOLDOWN = 0.15;
const MAX_MOVES = 14;

/*
 * U = empty goal
 * G = winning goal
 * B = box
 * # = wall
 * - = empty space
 */
const GAME_LEVEL = [
    "#######",
    "#-----#",
    "#---B-#",
    "#--BEE#",
    "#-----#",
    "#-----#",
    "#######"
]

function drawLevel(ctx,levelData, palette, x = 0, y = 0, scaleX = 1, scaleY = 1){

    
    for (let i = 0; i < levelData.length; i++) {
        for (let j = 0; j < levelData[i].length; j++) {
            const levelElem = levelData[i].charAt(j);
            // i is vertical offset
            // j is horizontal offset
            // modify TC to draw different sprites from palette
            const posX = x + (GLOBAL_CELL_SIZE_X * j * scaleX);
            const posY = y + (GLOBAL_CELL_SIZE_Y * i * scaleY);
            const sx = GLOBAL_CELL_SIZE_X * scaleX;
            const sy = GLOBAL_CELL_SIZE_Y * scaleY;
            // There are only 5 things so this is fine
            switch (levelElem) {
                case '#':
                    //console.log("Wall "+i)
                    drawSprite(ctx, palette, 0, 0, GLOBAL_CELL_SIZE_X, GLOBAL_CELL_SIZE_Y, posX, posY, sx, sy)
                    break;
            
                case '-':
                    //console.log("Space " + i)
                    drawSprite(ctx, palette, 16, 0, GLOBAL_CELL_SIZE_X, GLOBAL_CELL_SIZE_Y, posX, posY, sx, sy)
                    break;
                
                case 'B':
                    //console.log("Bomb " + i)
                    drawSprite(ctx, palette, 0, 16, GLOBAL_CELL_SIZE_X, GLOBAL_CELL_SIZE_Y, posX, posY, sx, sy)
                    break;
                
                case 'E': // goal that isnt in a winning state
                    //console.log("Goal " + i)
                    drawSprite(ctx, palette, 16, 16, GLOBAL_CELL_SIZE_X, GLOBAL_CELL_SIZE_Y, posX, posY, sx, sy)
                    break;
                case 'G': // goal that isnt in a winning state
                    //console.log("Goal " + i)
                    drawSprite(ctx, palette, 0, 16, GLOBAL_CELL_SIZE_X, GLOBAL_CELL_SIZE_Y, posX, posY, sx, sy)
                    break;
            }
        }
    }
}

function drawSprite(ctx, image, tcX, tcY,tsW, tsH, x, y, width, height){
    ctx.drawImage(
                image,
                tcX,
                tcY,
                tsW,
                tsH,
                x,
                y,
                width, 
                height
            );
}

class GameLevel{

    constructor(gameEngine, levelData, palette, maxMoves = 1, x = 0, y = 0, scaleX = 1, scaleY = 1, startPosition = {x: 1, y: 4}){
        this.removeFromWorld = false;
        this.orginalLevelData = structuredClone(levelData);
        // setup level data
        this.gameEngine = gameEngine;
        this.palette = palette;
        this.player = new Player(ASSET_MANAGER.getAsset(GameManifest.data[1]));;
        this.x = x;
        this.y = y;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        
        
        this.inputCounter = -1;
        
        // This is the actual level data, abstract later.
        // States PLAYING, WIN, IMPOSSIBLE, LOSE, DEBUG
        this.gameplayData = {wGoals: 0, rGoals: 0, boxCount: 0, movesMade: 0, maxMoves: maxMoves, state: "PLAYING"} // currently Won goals, required goals to win, box count
        this.startPosition = startPosition;
        this.levelData = levelData; // more of a map
        this.background = new SolidBackground();

        // User Interface
        this.textDisplay = new UIText("Text", 10, 107);
        this.titleDisplay = new UIText("SOKOBOMB", 10, 67);
        this.resetButton = new Button("Reset", 10, 147,100, 20, () => {
            // reset function
            this.gameEngine.addEntity(new GameLevel(this.gameEngine, this.orginalLevelData , this.palette, this.gameplayData.maxMoves, this.x, this.y, this.scaleX, this.scaleY, this.startPosition));
            this.removeFromWorld = true; 
        });

        // setup player in level
        this.player.posX = this.startPosition.x;
        this.player.posY = this.startPosition.y;
        this.player.scaleX = scaleX;
        this.player.scaleY = scaleY;
        this.player.offsetX = x;
        this.player.offsetY = y;

        

        // validate levelData
        if(this.isInvalidPosition(this.player.posX, this.player.posY)){
            throw new Error("Player started at invalid position ("+this.player.posX + ", "+this.player.posY+")");
        }
        
        if(maxMoves <= 0){
            throw new Error("Max moves must be greater than 0!")
        }

        for (let i = 0; i < levelData.length; i++) {
            for (let j = 0; j < levelData[i].length; j++) {
                const levelElem = levelData[i].charAt(j);
                switch (levelElem) {
                    case 'B':
                        //console.log("Bomb " + i)
                        this.gameplayData.boxCount += 1;
                        break;
                    case 'E': // goal that isnt in a winning state
                        //console.log("Goal " + i)
                        this.gameplayData.rGoals += 1;
                        break;
                    case 'G': // goal that isnt in a winning state
                        //console.log("Goal " + i)
                        throw new Error("Cannot start with a winning goal!")
                        
                }
            }
        }

        if(this.gameplayData.boxCount < this.gameplayData.rGoals || this.gameplayData.rGoals <= 0){
            throw new Error("Impossible to win! Increase box count or decrease goal count!")
        }
    }

    draw(ctx){
        this.background.draw(ctx);
        drawLevel(ctx,this.levelData, this.palette, this.x, this.y, this.scaleX, this.scaleY)
        this.player.draw(ctx);

        // User Interface After Everything else.
        this.textDisplay.draw(ctx);
        this.titleDisplay.draw(ctx);
        this.resetButton.draw(ctx);
    }

    update(){
        const deltaTime = this.gameEngine.clockTick;
        const state = this.gameplayData.state;

        this.accountForGameplay();
        
        this.resetButton.updateButton(this.gameEngine.mouse, this.gameEngine.click, this.gameEngine);

        if(state !== "PLAYING" && state !== "DEBUG"){
            this.textDisplay.updateText(state);
            return;
        }

        this.textDisplay.updateText("MOVES: "+(this.gameplayData.maxMoves - this.gameplayData.movesMade));

        // player input
        const inputResult = gatherInput(this.gameEngine);
        const input = inputResult.result;
        
        if (this.inputCounter > 0) {
            this.inputCounter -= deltaTime;
            return;
        }
        
        if (!inputResult.anythingPressed) {
            return;
        }

        this.player.characterFacing(input);
        //console.log(this.gameplayData);
        // desired position
        const desPos = {x: this.player.posX + input.x, y: this.player.posY + input.y};
        

        this.inputCounter = INPUT_COOLDOWN;
        //console.log("Move Input ("+input.x+" ," + input.y + " )");
        // if there is input reset the counter.
        if(this.isInvalidPosition(desPos.x, desPos.y)){
            
            return;
        }
        // this needs the order changed down
        
        //BOX PUSHING SYSTEM

        // if desired position is a box/bomb
        //console.log("("+desPos.x+","+desPos.y+")"+ this.levelData[desPos.y].charAt(desPos.x));

        if(this.levelData[desPos.y].charAt(desPos.x) !== 'B' && this.levelData[desPos.y].charAt(desPos.x) !== 'G'){
            this.player.posX += input.x;
            this.player.posY += input.y;
            this.gameplayData.movesMade += 1;
            return;
        }

        // where the box wants to go.
        const boxDesPos = {x: desPos.x + input.x, y: desPos.y + input.y}
        
        if(this.isInvalidPosition(boxDesPos.x, boxDesPos.y)){
            return;
        }
        
        // if trying to move box into another box - could be a way to solve puzzles later?
        if(this.levelData[boxDesPos.y].charAt(boxDesPos.x) === 'B'){
            return;
        }

        this.player.posX += input.x;
        this.player.posY += input.y;
        this.gameplayData.movesMade += 1;

        // pushing a box
        if(this.levelData[desPos.y].charAt(desPos.x) === 'B'){
            this.levelData[desPos.y] = replaceAt(this.levelData[desPos.y], desPos.x, '-');
            
            // box pushed into goal?
            if(this.levelData[boxDesPos.y].charAt(boxDesPos.x) === 'E'){
                this.levelData[boxDesPos.y] = replaceAt(this.levelData[boxDesPos.y], boxDesPos.x, 'G');
                this.gameplayData.wGoals += 1;
            }
            else{
                // box pushed into other space
                this.levelData[boxDesPos.y] = replaceAt(this.levelData[boxDesPos.y], boxDesPos.x, 'B');
            }
            
        }
        else if(this.levelData[desPos.y].charAt(desPos.x) === 'G'){ // it was a box on a goal spot

            this.levelData[desPos.y] = replaceAt(this.levelData[desPos.y], desPos.x, 'E');

            // box pushed into goal?
            if(this.levelData[boxDesPos.y].charAt(boxDesPos.x) === 'E'){
                this.levelData[boxDesPos.y] = replaceAt(this.levelData[boxDesPos.y], boxDesPos.x, 'G');
                
            }
            else{
                // box pushed into other space
                this.levelData[boxDesPos.y] = replaceAt(this.levelData[boxDesPos.y], boxDesPos.x, 'B');
                this.gameplayData.wGoals -= 1;
            } 
        }
        
        
    }

    isInvalidPosition(x, y){
        return (x >= this.levelData.length || x < 0 || y >= this.levelData[0].length || y < 0 || this.levelData[x].charAt(y) === '#')
    }

    accountForGameplay(){

        if(this.gameplayData.state === "DEBUG"){
            return;
        }

        if(this.gameplayData.wGoals === this.gameplayData.rGoals){
            this.gameplayData.state = "WIN";
        }
        if(this.gameplayData.movesMade >= this.gameplayData.maxMoves){
            this.gameplayData.state = "LOSE";
        }
    }
}

class Player{
    constructor(playerSprite){
        this.playerSprite = playerSprite;
        this.posX = 0;
        this.posY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.texX = 0;
        this.texY = 0;
    }

    draw(ctx){
        drawSprite(ctx, this.playerSprite, this.texX, this.texY, GLOBAL_CELL_SIZE_X, GLOBAL_CELL_SIZE_Y, GLOBAL_CELL_SIZE_X* this.posX *this.scaleX + this.offsetX, GLOBAL_CELL_SIZE_X* this.posY *this.scaleY + this.offsetY, GLOBAL_CELL_SIZE_X * this.scaleX, GLOBAL_CELL_SIZE_X * this.scaleY)
    }
    
    characterFacing(input){

        if(input.x > 0){ // Right
            this.texX = 16;
        }   
        else if(input.x < 0){ // Left
            this.texX = 32;
        } 
        else if(input.y < 0){ // Up
            this.texX = 48;
        }
        else if(input.y > 0){ // Down
            this.texX = 0;
        }
    }
}

class SolidBackground{
    constructor(colorString = "#0f380f"){
        this.colorString = colorString;
    }

    draw(ctx){
        ctx.save();
        ctx.fillStyle = this.colorString;
        
        ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

    }

    
}

class UIText {
  constructor(text = "Text", x = 0, y = 0) {
    
    
    this.text = text;
    this.x = x;
    this.y = y;
    this.remSize = 3.2;
    
  }

  updateText(newText) {
    this.text = newText;
  }

  draw(ctx) {
    ctx.save();
    
    ctx.font = this.remSize + "rem Pixelify Sans";
    //ctx.textAlign = "center";
    //ctx.textBaseline = "middle";
    ctx.fillStyle = "#9bbc0f"
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }


}

class Button {
    constructor(text = "Text", x = 0, y = 0, width = 100, height = 100, onPressButton = null) {
        
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.remSize = 3.2;
        this.colorString = "#9bbc0f";
        this.enabled = true;
        this.onPressButton = onPressButton;
    }

    updateButton(mousePos, clickPos, gameEngine) {
        if(!this.enabled){
            return;
        }

        const posInside = mousePos === null ? false : this.pointInside(mousePos.x, mousePos.y);
        const clickedInside = clickPos === null ? false : this.pointInside(clickPos.x, clickPos.y);

        if(posInside){
            this.colorString = "#306230";
            this.remSize = 3.6;
        }
        else{
            this.colorString = "#9bbc0f";
            this.remSize = 3.2;
        }

        if (clickPos !== null && posInside && clickedInside) {
            

            if (this.onPressButton !== null) {
                this.onPressButton();
            }
            gameEngine.click = null;
            
        }
    }

    draw(ctx) {
        if(!this.enabled){
            return;
        }

        ctx.save();
        
        ctx.font = this.remSize + "rem Pixelify Sans";
        //ctx.textAlign = "center";
        //ctx.textBaseline = "middle";
        ctx.fillStyle = this.colorString;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }

    pointInside(px, py) {
            return (
            px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y - this.height &&
            py <= this.y 
            );
    }
}



function gatherInput(gameEngine){
    //check which direction the player is moving
    let result = {x: 0, y: 0}
    let anythingPressed = false;
    if (gameEngine.keys['ArrowUp'] || gameEngine.keys['w']) {
        result.y -= 1;
        anythingPressed = true;
    }
    if (gameEngine.keys['ArrowDown'] || gameEngine.keys['s']) {
        result.y += 1;
        anythingPressed = true;
        
    }
    if (gameEngine.keys['ArrowLeft'] || gameEngine.keys['a']) {
        result.x -= 1;
        anythingPressed = true;
    }
    if (gameEngine.keys['ArrowRight'] || gameEngine.keys['d']) {
        result.x += 1;
        anythingPressed = true;
    }
    
    //
    return {result: result, anythingPressed: anythingPressed};
}
    
function replaceAt(originalString, index, replacement) {
  // Check if index is out of bounds
  if (index < 0 || index >= originalString.length) {
    return originalString;
  }
  
  // Create a new string by concatenating the parts
  return originalString.slice(0, index) + replacement + originalString.slice(index + 1);
}

