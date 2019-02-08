/**
 *
 * @param {Game} game
 * @constructor
 */
function InputGui(game) {

    this.b_allow_input = true;
    var
        b_mouse_down = false,
        b_mouse_drag = false,
        n_drag_hex_x = -1,
        n_drag_hex_y = -1,
        source_drag_part = null;

    let that = this;
    var drags = [];

    game.onGameMouseMove =  function (coords,is_valid /*,eventInfo*/) {
        if (!that.b_allow_input) {return}
        b_mouse_drag = b_mouse_down;

        let valid = false;
        // Check if the mouse's coords are on the board
        if (is_valid) {
            valid = true;
            if (b_mouse_drag) {

                if (((n_drag_hex_x !== coords.hexX) || (n_drag_hex_y !== coords.hexY)) && (!drags[coords.hexX][coords.hexY])) {
                    let current_part = game.parts.get_part(coords.hexX, coords.hexY);
                    if (!current_part) {

                        //drag to empty
                        if (source_drag_part) {
                            let id = source_drag_part.get_player_id();

                            // make sure there is at least one similar touching, else the drag skipped a hex
                            let player_ids_touching = game.parts.get_players_touching_coords(coords.hexX, coords.hexY);
                            let b_found_same_player = false;
                            for (let i = 0; i < player_ids_touching.length; i++) {
                                let player_id = player_ids_touching[i];
                                if (player_id === id) {
                                    b_found_same_player = true;
                                    break;
                                }
                            }
                            if (b_found_same_player) {
                                game.parts.set_part(coords.hexX, coords.hexY, id);
                            } else {
                                valid = false;
                            }
                        }
                    } else {
                        //if the current is the same player id as the source, then
                        if (source_drag_part.get_player_id() === current_part.get_player_id()) {
                            game.parts.set_part(n_drag_hex_x, n_drag_hex_y, null);
                            source_drag_part = current_part;
                        } else {
                            valid = false;
                        }
                    }
                    drags[coords.hexX][coords.hexY] = true;
                }

            }

            game.refresh(coords.hexX, coords.hexY, !b_mouse_drag);

        }

        if (!valid) {
            //cancel mouse drag
            b_mouse_down = false;
            b_mouse_drag = false;
            source_drag_part = null;
            n_drag_hex_y = -1;
            n_drag_hex_x = -1;
            drags = [];
        }


    };


    game.onGameMouseDown =  function (coords,is_valid /*,eventInfo*/) {
        if (!that.b_allow_input) {return}
        if (is_valid) {
            n_drag_hex_y = coords.hexY;
            n_drag_hex_x = coords.hexX;

            b_mouse_down = true;

            source_drag_part = game.parts.get_part(n_drag_hex_x, n_drag_hex_y);

            for (let i = 0; i < game.hexers.boardWidth; i++) {
                drags[i] = [];
                for (let j = 0; j < game.hexers.boardHeight; j++) {
                    drags[i][j] = false;
                }
            }

            drags[n_drag_hex_x][n_drag_hex_y] = true;
        }

    };


    game.onGameMouseUp =  function (/*coords,is_valid /*,eventInfo*/) {
        if (!that.b_allow_input) {return}
        b_mouse_down = false;
        b_mouse_drag = false;
        source_drag_part = null;
        n_drag_hex_y = -1;
        n_drag_hex_x = -1;
        drags = [];

    };
}