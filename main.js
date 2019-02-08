(function(){

    let player_colors = ['#00CC00','#0000CC'];
    let player_names = ['A','B'];
    const NUMBER_PLAYERS = 2;
    const BOARD_WIDTH = 20;
    const BOARD_HEIGHT = 20;
    const SIDE_LENGTH = 18;
    /**
     * @type {PlayerInfoStruct[]} player_info
     */
    let player_info= [];
    for(let i = 0; i < NUMBER_PLAYERS; i++) {
        let color = player_colors[i];
        let name = player_names[i];
        player_info.push(new PlayerInfoStruct(i,color,name));
    }

    // noinspection JSUnusedLocalSymbols
    const DECAY = 0.1;
    const CANVAS_ID = 'hexmap';

    var game = new Game(CANVAS_ID,player_info,BOARD_WIDTH,BOARD_HEIGHT,SIDE_LENGTH);

    var
        b_mouse_down = false,
        b_mouse_drag = false,
        n_drag_hex_x = -1,
        n_drag_hex_y = -1,
        source_drag_part = null;


    var drags = [];

// players array, each like colors but filled with class that has def, att, b_is_connected, base_color,last_move_tick
    //sum att for all player's hexes is 1, sum def for all player's hexes is 1
    // if not connected, then each attack diminishes by decay each tick to 0, if connected then grows by decay each tick to limit
    // merge hexes occupied by player by moving one into the other
    // gain ground by moving a filled hex to an empty one
    // each new or condensed hex cannot move again that tick
    //double click to move all connected hex, hex cannot go past board or into other player, moved hexes, if connected to source
    // will stay connected drawing a thin line to the source

    //natural terrain, can modify att or def for that hex, can change how fast can move, can modify decay(-+ or both for all attributes)
    game.parts.set_part(0,0,0);
    game.parts.set_part(game.hexers.boardWidth-1,game.hexers.boardHeight-1,1);
    game.refresh();



        game.hexers.canvas.addEventListener("mousemove", function(eventInfo) {

            b_mouse_drag = b_mouse_down;

            let x = eventInfo.offsetX || eventInfo.layerX;
            let y = eventInfo.offsetY || eventInfo.layerY;

            let coords = game.hexers.get_board_coords(x,y);

            let valid = false;
            // Check if the mouse's coords are on the board
            if(coords.hexX >= 0 && coords.hexX < game.hexers.boardWidth) {
                if (coords.hexY >= 0 && coords.hexY < game.hexers.boardHeight) {
                    valid = true;
                    if (b_mouse_drag) {

                        if ( ((n_drag_hex_x !== coords.hexX) || (n_drag_hex_y !== coords.hexY)) && (!drags[coords.hexX][coords.hexY])) {
                            let current_part = game.parts.get_part(coords.hexX,coords.hexY);
                            if (!current_part ) {

                                //drag to empty
                                if (source_drag_part) {
                                    let id = source_drag_part.get_player_id();

                                    // make sure there is at least one similar touching, else the drag skipped a hex
                                    let player_ids_touching = game.parts.get_players_touching_coords(coords.hexX,coords.hexY);
                                    let b_found_same_player = false;
                                    for(let i= 0; i < player_ids_touching.length; i++) {
                                        let player_id = player_ids_touching[i];
                                        if (player_id === id) {
                                            b_found_same_player = true;
                                            break;
                                        }
                                    }
                                    if (b_found_same_player) {
                                        game.parts.set_part(coords.hexX,coords.hexY,id);
                                    } else {
                                        valid = false;
                                    }
                                }
                            } else {
                                //if the current is the same player id as the source, then
                                if (source_drag_part.get_player_id() === current_part.get_player_id()) {
                                    game.parts.set_part(n_drag_hex_x,n_drag_hex_y,null);
                                    source_drag_part = current_part;
                                } else {
                                    valid = false;
                                }
                            }
                            drags[coords.hexX][coords.hexY] = true;
                        }

                    }

                    game.refresh(coords.hexX, coords.hexY,!b_mouse_drag);
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


    game.hexers.canvas.addEventListener("mousedown", function(eventInfo) {

            let x = eventInfo.offsetX || eventInfo.layerX;
            let y = eventInfo.offsetY || eventInfo.layerY;

            let coords = game.hexers.get_board_coords(x,y);
            n_drag_hex_y = coords.hexY;
            n_drag_hex_x = coords.hexX;

            b_mouse_down = true;

            source_drag_part = game.parts.get_part(n_drag_hex_x,n_drag_hex_y);

            for(let i = 0; i < game.hexers.boardWidth; i++){
                drags[i] = [];
                for(let j = 0; j < game.hexers.boardHeight; j++){
                    drags[i][j] = false;
                }
            }

            drags[n_drag_hex_x][n_drag_hex_y] = true;

        });


    game.hexers.canvas.addEventListener("mouseup", function(/*eventInfo*/) {

            b_mouse_down = false;
            b_mouse_drag = false;
            source_drag_part = null;
            n_drag_hex_y =-1;
            n_drag_hex_x = -1;
            drags = [];

        });



})();