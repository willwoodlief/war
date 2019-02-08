/**
 *
 * @param {Number} id
 * @param {string} color
 * @param {string} name
 * @constructor
 */
function PlayerInfoStruct(id,color,name){
    /**
     *
     * @type {Number}
     */
    this.id = id;

    /**
     * @type {string} color - the base color of the player
     */
    this.color = color;
    /**
     * @var {string} name
     */
    this.player_name = name;
}

/**
 *
 * @constructor
 */
function PlayerManager() {
    let player_colors = ['#00CC00', '#0000CC'];
    let player_names = ['A', 'B'];
    const NUMBER_PLAYERS = 2;

    /**
     * @return {PlayerInfoStruct[]}
     */
    this.get_player_info = function() {
        /**
         * @type {PlayerInfoStruct[]} player_info
         */
        let player_info = [];
        for (let i = 0; i < NUMBER_PLAYERS; i++) {
            let color = player_colors[i];
            let name = player_names[i];
            player_info.push(new PlayerInfoStruct(i, color, name));
        }
        return player_info;
    }
}