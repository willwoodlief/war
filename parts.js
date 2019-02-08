/**
 *
 * @param {PartsStuff} parts
 * @param {Number} player_id
 * @param {Number} att
 * @param {Number} def
 * @constructor
 */
function Part(parts,player_id,att,def) {
    this.parts = parts;
    this.player_id = player_id;
    this.att = att || 0;
    this.def = def || 0;

    this.stamp = function(x,y) {
        let ctx = this.parts.game.hexers.ctx;
        let old_font = ctx.font;
        let old_fill_color = ctx.fillStyle;
        let fx = x + (parts.game.hexers.hexRectangleWidth/4);
        let fy = y + (parts.game.hexers.hexRectangleHeight/2.25);
        ctx.font = "10px sans-serif";
        ctx.fillStyle = '#FFFFFF';

        let display_att = Math.round(this.att * 1000);
        let display_def = Math.round(this.def * 1000);

        ctx.fillText(''+ display_att, fx, fy);

        fy += (parts.game.hexers.hexRectangleHeight/3);
        ctx.fillText(''+ display_def, fx, fy);

        ctx.font = old_font;
        ctx.fillStyle = old_fill_color;
    };

    this.get_color = function() {
        return parts.game.player_info[this.player_id].color;
    };

    this.get_player_name = function() {
        return this.parts.game.player_info[this.player_id].player_name;
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
 * @param {Game} game
 * @constructor
 */
function PartsStuff(game) {

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
    for (let x = 0; x < game.hexers.boardWidth; x++) {
        this.parts[x] = [];
        for (let y = 0; y < game.hexers.boardHeight; y++) {
            this.parts[x][y] = null;
        }
    }

    this.game = game;


    /**
     *
     * @param {Number}x
     * @param {Number}y
     * @return {null|Part}
     */
    this.get_part = function (x, y) {
        x = parseInt(x.toString());
        y = parseInt(y.toString());
        if (x >= 0 && x < this.game.hexers.boardWidth) {
            if (y >= 0 && y < this.game.hexers.boardHeight) {
                return this.parts[x][y];
            }
        }
        return null;
    };

    /**
     *
     * @param {Number}x
     * @param {Number}y
     * @param {null|Number} player_id
     */
    this.set_part = function (x, y, player_id) {
        let part = null;
        if (player_id !== null) {
            part = new Part(this,player_id,0,0);
        }

        x = parseInt(x.toString());
        y = parseInt(y.toString());
        if (x >= 0 && x < this.game.hexers.boardWidth) {
            if (y >= 0 && y < this.game.hexers.boardHeight) {
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