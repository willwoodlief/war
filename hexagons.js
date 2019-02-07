(function(){

    let player_colors = ['#00CC00','#0000CC'];
    let player_names = ['A','B'];
    const NUMBER_PLAYERS = 2;
    // noinspection JSUnusedLocalSymbols
    const DECAY = 0.1;
    let current_tick = 0;

    var canvas = document.getElementById('hexmap');

    var hexHeight,
        hexRadius,
        hexRectangleHeight,
        hexRectangleWidth,
        hexagonAngle = 0.523598776, // 30 degrees in radians
        sideLength = 18,
        boardWidth = 20,
        boardHeight = 20,
        b_mouse_down = false,
        b_mouse_drag = false,
        n_drag_hex_x = -1,
        n_drag_hex_y = -1,
        source_drag_part = null;

    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight;
    hexRectangleWidth = 2 * hexRadius;


    function PlayerInfoStruct(id,color,name){
        // noinspection JSUnusedGlobalSymbols
        this.id = id;
        this.color = color;
        /**
         * @var {string} name
         */
        this.player_name = name;
    }

    /**
     * @type {PlayerInfoStruct[]} player_info
     */
    let player_info= [];
    for(let i = 0; i < NUMBER_PLAYERS; i++) {
        let color = player_colors[i];
        let name = player_names[i];
        player_info.push(new PlayerInfoStruct(i,color,name));
    }


    /**
     *
     * @param {Number} player_id
     * @param {Number} start_tick
     * @param {Number} att
     * @param {Number} def
     * @constructor
     */
    function Part(player_id,start_tick,att,def) {
        this.player_id = player_id;
        this.att = att || 0;
        this.def = def || 0;

        this.stamp = function(ctx,x,y) {
            let old_font = ctx.font;
            let old_fill_color = ctx.fillStyle;
            let fx = x + (hexRectangleWidth/4);
            let fy = y + (hexRectangleHeight/2.25);
            ctx.font = "10px sans-serif";
            ctx.fillStyle = '#FFFFFF';

            let display_att = Math.round(this.att * 1000);
            let display_def = Math.round(this.def * 1000);

            ctx.fillText(''+ display_att, fx, fy);

            fy += (hexRectangleHeight/3);
            ctx.fillText(''+ display_def, fx, fy);

            ctx.font = old_font;
            ctx.fillStyle = old_fill_color;
        };

        this.get_color = function() {
            return player_info[this.player_id].color;
        };

        this.get_player_name = function() {
            return player_info[this.player_id].player_name;
        };

        this.get_player_id = function() {
            return this.player_id;
        };

        // noinspection JSUnusedGlobalSymbols
        this.toString = function() {
            let name = this.get_player_name();
            return name + ": att: " + this.att + " , def: " + this.def;
        }
    }



    /**
     *
     * @param {Number} boardWidth
     * @param {Number} boardHeight
     * @constructor
     */
    function PartsStuff(boardWidth,boardHeight) {

        this.NE = 0;
        this.E = 1;
        this.SE = 2;
        this.SW = 3;
        this.W = 4;
        this.NW = 5;
        /**
         * @type {Part[][]} this.parts
         */
        this.parts = [];
        for (let x = 0; x < boardWidth; x++) {
            this.parts[x] = [];
            for (let y = 0; y < boardHeight; y++) {
                this.parts[x][y] = null;
            }
        }

        /**
         *
         * @param {Number}x
         * @param {Number}y
         * @return {null|Part}
         */
        this.get_part = function (x, y) {
            x = parseInt(x.toString());
            y = parseInt(y.toString());
            if (x >= 0 && x < boardWidth) {
                if (y >= 0 && y < boardHeight) {
                    return this.parts[x][y];
                }
            }
            return null;
        };

        /**
         *
         * @param {Number}x
         * @param {Number}y
         * @param {null|Part} part
         */
        this.set_part = function (x, y, part) {
            x = parseInt(x.toString());
            y = parseInt(y.toString());
            if (x >= 0 && x < boardWidth) {
                if (y >= 0 && y < boardHeight) {
                    if (part) {
                        if (this.parts[x][y]) {
                            /**
                             * @type {Part} old
                             */
                            let old = this.parts[x][y];
                            throw new Error('Tried to set a part on a non empty space! [' + x + ',' + y + '] ' + old.toString());
                        }
                    }
                    this.parts[x][y] = part;
                    return;
                }
            }
            throw new Error('Tried to set a part out of bounds! [' + x + ',' + y + '] ');
        };

        /**
         *
         * @param {Number}x
         * @param {Number}y
         * @return {Part[]}
         */
        this.get_all_neighbors = function (x, y) {
            let ret = [];
            for (let dir = 0; dir < 6; dir++) {
                let come = this.get_neighbor(x,y,dir);
                if (come) {
                    ret.push(come);
                }
            }
            return ret;
        };

        /**
         *
         * @param {Number} x
         * @param {Number} y
         * @return {Number[]}
         */
        this.get_players_touching_coords = function(x,y) {
          let  ret = [];
          let s = this.get_all_neighbors(x,y);
          let lookup = {};
          for(let i = 0; i < s.length; i++) {
              let other_player_id = s[i].get_player_id();
              lookup[other_player_id] = s[i];
          }

          for (let id in lookup) {
              if (!lookup.hasOwnProperty(id)) {continue;}
              ret.push(parseInt(id));
          }
          return ret;

        };


        /**
         *
         * @param {Number} x
         * @param  {Number} y
         * @param  {Number} dir
         * @return {Part}
         */
        this.get_neighbor = function (x, y, dir) {
            let rel_x = x;
            let rel_y = y;
            let bump = y % 2;
            if (bump) {
                //x is 1 to the right
                switch (dir) {
                    case this.NE: {
                        rel_x++;
                        rel_y--;
                        break;
                    }
                    case this.E: {
                        rel_x++;
                        break;
                    }
                    case this.SE: {
                        rel_x++;
                        rel_y++;
                        break;
                    }
                    case this.SW: {
                        rel_y++;
                        break;
                    }
                    case this.W: {
                        rel_x--;
                        break;
                    }
                    case this.NW: {
                        rel_y--;
                        break;
                    }
                    default: {
                        throw new Error("direction is only 0 through 5 inclusive, passed was " + dir);
                    }
                }
            } else {
                //x is 1 to the left
                switch (dir) {
                    case this.NE: {
                        rel_y--;
                        break;
                    }
                    case this.E: {
                        rel_x++;
                        break;
                    }
                    case this.SE: {
                        rel_y++;
                        break;
                    }
                    case this.SW: {
                        rel_y++;
                        rel_x--;
                        break;
                    }
                    case this.W: {
                        rel_x--;
                        break;
                    }
                    case this.NW: {
                        rel_y--;
                        rel_x--;
                        break;
                    }
                    default: {
                        throw new Error("direction is only 0 through 5 inclusive, passed was " + dir);
                    }
                }
            }
            return this.get_part(rel_x, rel_y);

        };
    }



    var drags = [];
    var parts = new PartsStuff(boardWidth,boardHeight);
// players array, each like colors but filled with class that has def, att, b_is_connected, base_color,last_move_tick
    //sum att for all player's hexes is 1, sum def for all player's hexes is 1
    // if not connected, then each attack diminishes by decay each tick to 0, if connected then grows by decay each tick to limit
    // merge hexes occupied by player by moving one into the other
    // gain ground by moving a filled hex to an empty one
    // each new or condensed hex cannot move again that tick
    //double click to move all connected hex, hex cannot go past board or into other player, moved hexes, if connected to source
    // will stay connected drawing a thin line to the source

    //natural terrain, can modify att or def for that hex, can change how fast can move, can modify decay(-+ or both for all attributes)
    let p  = new Part(1,0,.95,.94);
    parts.set_part(0,0,p);
    p = new Part(0,0,.95,.94);
    parts.set_part(boardWidth-1,boardHeight-1,p);




    if (canvas.getContext){
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#CCCCCC";
        ctx.lineWidth = 1;

        drawBoard(ctx, boardWidth, boardHeight);

        canvas.addEventListener("mousemove", function(eventInfo) {
            var x,
                y,
                hexX,
                hexY;

            b_mouse_drag = b_mouse_down;


            x = eventInfo.offsetX || eventInfo.layerX;
            y = eventInfo.offsetY || eventInfo.layerY;


            hexY = Math.floor(y / (hexHeight + sideLength));
            hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);

            let valid = false;
            // Check if the mouse's coords are on the board
            if(hexX >= 0 && hexX < boardWidth) {
                if (hexY >= 0 && hexY < boardHeight) {
                    valid = true;
                    if (b_mouse_drag) {

                        if ( ((n_drag_hex_x !== hexX) || (n_drag_hex_y !== hexY)) && (!drags[hexX][hexY])) {
                            if (!parts.get_part(hexX,hexY) ) {

                                //drag to empty
                                if (source_drag_part) {
                                    let id = source_drag_part.get_player_id();

                                    // make sure there is at least one similar touching, else the drag skipped a hex
                                    let player_ids_touching = parts.get_players_touching_coords(hexX,hexY);
                                    let b_found_same_player = false;
                                    for(let i= 0; i < player_ids_touching.length; i++) {
                                        let player_id = player_ids_touching[i];
                                        if (player_id === id) {
                                            b_found_same_player = true;
                                            break;
                                        }
                                    }
                                    if (b_found_same_player) {
                                        let new_part = new Part(id,current_tick,source_drag_part.att,source_drag_part.def);
                                        parts.set_part(hexX,hexY,new_part);
                                    } else {
                                        valid = false;
                                    }
                                }
                            } else {
                                //if the current is the same player id as the source, then
                                if (source_drag_part.get_player_id() === parts.get_part(hexX,hexY).get_player_id()) {
                                    parts.set_part(n_drag_hex_x,n_drag_hex_y,null);
                                    source_drag_part = parts.get_part(hexX,hexY);
                                } else {
                                    valid = false;
                                }
                            }
                            drags[hexX][hexY] = true;
                        }

                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawBoard(ctx, boardWidth, boardHeight);
                    drawHexagon(ctx, hexX, hexY,!b_mouse_drag);
                }
            }

            if(!valid) {
                //cancel mouse drag
                b_mouse_down = false;
                b_mouse_drag = false;
                source_drag_part = null;
                n_drag_hex_y =-1;
                n_drag_hex_x = -1;
                drags = [];
            }


        });


        canvas.addEventListener("mousedown", function(eventInfo) {

            let x = eventInfo.offsetX || eventInfo.layerX;
            let y = eventInfo.offsetY || eventInfo.layerY;

            n_drag_hex_y = Math.floor(y / (hexHeight + sideLength));
            n_drag_hex_x = Math.floor((x - (n_drag_hex_y % 2) * hexRadius) / hexRectangleWidth);

            b_mouse_down = true;

            source_drag_part = parts.get_part(n_drag_hex_x,n_drag_hex_y);

            for(let i = 0; i < boardWidth; i++){
                drags[i] = [];
                for(let j = 0; j < boardHeight; j++){
                    drags[i][j] = false;
                }
            }

            drags[n_drag_hex_x][n_drag_hex_y] = true;

        });


        canvas.addEventListener("mouseup", function(/*eventInfo*/) {

            b_mouse_down = false;
            b_mouse_drag = false;
            source_drag_part = null;
            n_drag_hex_y =-1;
            n_drag_hex_x = -1;
            drags = [];

        });
    }

    function drawBoard(canvasContext, width, height) {
        var i,
            j;

        for(i = 0; i < width; ++i) {
            for(j = 0; j < height; ++j) {
                drawHexagon(
                    ctx,
                    i ,
                    j
                );
            }
        }
    }

    function drawHexagon(canvasContext, i, j, cursor) {
        cursor = cursor || false;

        let x = i * hexRectangleWidth + ((j % 2) * hexRadius);
        let y = j * (sideLength + hexHeight);

        canvasContext.beginPath();
        canvasContext.moveTo(x + hexRadius, y);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
        canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
        canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
        canvasContext.lineTo(x, y + sideLength + hexHeight);
        canvasContext.lineTo(x, y + hexHeight);
        canvasContext.closePath();

        let old_fill_color = ctx.fillStyle;
        if(cursor) {
            let color = "#000000";
            ctx.fillStyle = color;
            canvasContext.fill();
            
        } else {
            //see if part is there
            if (parts.get_part(i,j)) {
                let part = parts.get_part(i,j);
                let color = part.get_color();
                ctx.fillStyle = color;
                canvasContext.fill();
                part.stamp(canvasContext,x,y);
            }
        }
        canvasContext.stroke();
        ctx.fillStyle = old_fill_color;
    }

})();