/**
 *
 * @param {string} canvas_id
 * @param {PlayerManager} player_manager
 * @param {number} boardWidth
 * @param {number}boardHeight
 * @param {number}sideLength
 * @constructor
 */
function Game(canvas_id,player_manager, boardWidth, boardHeight, sideLength) {

    this.fillStyle = "#000000";
    this.strokeStyle = "#CCCCCC";
    this.lineWidth = 1;
    this.cursor_color = "#000000";
    this.player_manager = player_manager;
    this.player_info = this.player_manager.get_player_info();
    this.hexers = new Hexer(canvas_id,boardWidth,boardHeight,sideLength,this);
    this.parts = new PartsStuff(this);

    this.p_onGameMouseDown = function(coords,is_valid ,eventInfo) {
        if (this.onGameMouseDown) {
            this.onGameMouseDown(coords,is_valid,eventInfo);
        }
    };

    this.p_onGameMouseMove = function(coords,is_valid ,eventInfo) {
        if (this.onGameMouseMove) {
            this.onGameMouseMove(coords,is_valid,eventInfo);
        }
    };

    this.p_onGameMouseUp = function(coords,is_valid ,eventInfo) {
        if (this.onGameMouseUp) {
            this.onGameMouseUp(coords,is_valid,eventInfo);
        }
    };

    this.onGameMouseDown = null;
    this.onGameMouseMove = null;
    this.onGameMouseUp = null;


    this.refresh = function(cursor_x,cursor_y,b_mark) {
        cursor_x = cursor_x || null;
        cursor_y = cursor_y || null;
        b_mark  =  b_mark || false;
        this.hexers.drawBoard();
        if (cursor_x !== null && cursor_y !== null) {
            this.hexers.drawHexagon(cursor_x,cursor_y,b_mark);
        }
    };


}