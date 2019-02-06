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
        // noinspection JSUnusedGlobalSymbols
        this.name = name;
    }

    let player_info= [];
    for(let i = 0; i < NUMBER_PLAYERS; i++) {
        let color = player_colors[i];
        let name = player_names[i];
        player_info.push(new PlayerInfoStruct(i,color,name));
    }


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

        this.get_player_id = function() {
            return this.player_id;
        };




    }


    var parts = [];
    var drags = [];
    for(var x = 0; x < boardWidth; x++){
        parts[x] = [];
        for(var y = 0; y < boardHeight; y++){
            parts[x][y] = null;
        }
    }
// players array, each like colors but filled with class that has def, att, b_is_connected, base_color,last_move_tick
    //sum att for all player's hexes is 1, sum def for all player's hexes is 1
    // if not connected, then each attack diminishes by decay each tick to 0, if connected then grows by decay each tick to limit
    // merge hexes occupied by player by moving one into the other
    // gain ground by moving a filled hex to an empty one
    // each new or condensed hex cannot move again that tick
    //double click to move all connected hex, hex cannot go past board or into other player, moved hexes, if connected to source
    // will stay connected drawing a thin line to the source

    //natural terrain, can modify att or def for that hex, can change how fast can move, can modify decay(-+ or both for all attributes)
    parts[0][0] = new Part(1,0,.95,.94);
    parts[boardWidth-1][boardHeight-1] = new Part(0,0,.95,.94);




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
                            if (!parts[hexX][hexY]) {
                                //todo make sure there is at least one similar touching, else the drag skipped a hex

                                //drag to empty
                                if (source_drag_part) {
                                    let id = source_drag_part.get_player_id();
                                    let new_part = new Part(id,current_tick,source_drag_part.att,source_drag_part.def);
                                    parts[hexX][hexY] = new_part;
                                }
                            } else {
                                //if the current is the same player id as the source, then
                                if (source_drag_part.get_player_id() === parts[hexX][hexY].get_player_id()) {
                                    parts[n_drag_hex_x][n_drag_hex_y] = null;
                                    source_drag_part = parts[hexX][hexY];
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

            if (parts[n_drag_hex_x][n_drag_hex_y]) {
                source_drag_part = parts[n_drag_hex_x][n_drag_hex_y];
            } else {
                source_drag_part = null;
            }

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
            if (parts[i][j]) {
                let part = parts[i][j];
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