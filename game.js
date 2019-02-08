/**
 *
 * @param {string} canvas_id
 * @param {PlayerInfoStruct[]} player_info
 * @param {number} boardWidth
 * @param {number}boardHeight
 * @param {number}sideLength
 * @constructor
 */
function Game(canvas_id,player_info, boardWidth, boardHeight, sideLength) {

    this.fillStyle = "#000000";
    this.strokeStyle = "#CCCCCC";
    this.lineWidth = 1;
    this.cursor_color = "#000000";
    this.player_info = player_info;
    this.hexers = new Hexer(canvas_id,boardWidth,boardHeight,sideLength,this);
    this.parts = new PartsStuff(this);

    this.refresh = function(cursor_x,cursor_y,b_mark) {
        cursor_x = cursor_x || null;
        cursor_y = cursor_y || null;
        b_mark  =  b_mark || false;
        this.hexers.drawBoard();
        if (cursor_x !== null && cursor_y !== null) {
            this.hexers.drawHexagon(cursor_x,cursor_y,b_mark);
        }

    }
}