(function () {

    const BOARD_WIDTH = 20;
    const BOARD_HEIGHT = 20;
    const SIDE_LENGTH = 18;

    // noinspection JSUnusedLocalSymbols
    const DECAY = 0.1;
    const CANVAS_ID = 'hexmap';

    let foo = function() {
        let player_manager = new PlayerManager();
        var game = new Game(CANVAS_ID, player_manager, BOARD_WIDTH, BOARD_HEIGHT, SIDE_LENGTH);
        var input_gui = new InputGui(game);
        input_gui.b_allow_input = true;

        //starting places
        let places = [
            {x:0,y:0},
            {x:game.hexers.boardWidth - 1,y:game.hexers.boardHeight - 1}
        ];
        let player_info = player_manager.get_player_info();

        for(let i =0; i < places.length && i < player_info.length; i++) {
            let player = player_info[i];
            let coords = places[i];
            game.parts.set_part(coords.x, coords.y, player.id);
        }

        game.refresh();

    };

    window.onload = foo;




// players array, each like colors but filled with class that has def, att, b_is_connected, base_color,last_move_tick
    //sum att for all player's hexes is 1, sum def for all player's hexes is 1
    // if not connected, then each attack diminishes by decay each tick to 0, if connected then grows by decay each tick to limit
    // merge hexes occupied by player by moving one into the other
    // gain ground by moving a filled hex to an empty one
    // each new or condensed hex cannot move again that tick
    //double click to move all connected hex, hex cannot go past board or into other player, moved hexes, if connected to source
    // will stay connected drawing a thin line to the source

    //natural terrain, can modify att or def for that hex, can change how fast can move, can modify decay(-+ or both for all attributes)







})();