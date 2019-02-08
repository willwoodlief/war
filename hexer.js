/**
 *
 * @param {string} canvas_id
 * @param {number} boardWidth
 * @param {number} boardHeight
 * @param {number} sideLength
 * @param {Game} game
 * @constructor
 */
function Hexer(canvas_id, boardWidth, boardHeight, sideLength,game) {
    const hexagonAngle = 0.523598776;
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.sideLength = sideLength;
    this.hexHeight = Math.sin(hexagonAngle) * sideLength;
    this.hexRadius = Math.cos(hexagonAngle) * sideLength;
    this.hexRectangleHeight = sideLength + 2 * this.hexHeight;
    this.hexRectangleWidth = 2 * this.hexRadius;
    this.canvas = document.getElementById(canvas_id);
    this.ctx = this.canvas.getContext('2d');
    this.game = game;

    this.ctx.fillStyle = game.fillStyle;
    this.ctx.strokeStyle = game.strokeStyle;
    this.ctx.lineWidth = game.lineWidth;
    let that = this;

    this.canvas.addEventListener("mousemove", function (eventInfo) {

        let x = eventInfo.offsetX || eventInfo.layerX;
        let y = eventInfo.offsetY || eventInfo.layerY;

        let coords = that.get_board_coords(x, y);
        let is_valid = false;
        if (coords.hexX >= 0 && coords.hexX < that.boardWidth) {
            if (coords.hexY >= 0 && coords.hexY < that.boardHeight) {
                is_valid = true;
            }
        }
        if (that.game.p_onGameMouseMove) {
            that.game.p_onGameMouseMove(coords,is_valid,eventInfo);
        }
    });

    this.canvas.addEventListener("mousedown", function (eventInfo) {

        let x = eventInfo.offsetX || eventInfo.layerX;
        let y = eventInfo.offsetY || eventInfo.layerY;

        let coords = that.get_board_coords(x, y);
        let is_valid = false;
        if (coords.hexX >= 0 && coords.hexX < that.boardWidth) {
            if (coords.hexY >= 0 && coords.hexY < that.boardHeight) {
                is_valid = true;
            }
        }

        if (that.game.p_onGameMouseDown) {
            that.game.p_onGameMouseDown(coords,is_valid,eventInfo);
        }
    });

    this.canvas.addEventListener("mouseup", function (eventInfo) {

        let x = eventInfo.offsetX || eventInfo.layerX;
        let y = eventInfo.offsetY || eventInfo.layerY;

        let coords = that.get_board_coords(x, y);
        let is_valid = false;
        if (coords.hexX >= 0 && coords.hexX < that.boardWidth) {
            if (coords.hexY >= 0 && coords.hexY < that.boardHeight) {
                is_valid = true;
            }
        }

        if (that.game.p_onGameMouseUp) {
            that.game.p_onGameMouseUp(coords,is_valid,eventInfo);
        }
    });
    /**
     * @param {Number} x
     * @param {Number} y
     * @return {{hexX: number, hexY: number}}
     */
    this.get_board_coords = function(x,y) {
        let hexY = Math.floor(y / (this.hexHeight + this.sideLength));
        let hexX = Math.floor((x - (hexY % 2) * this.hexRadius) / this.hexRectangleWidth);
        return {hexY: hexY, hexX: hexX};
    };

    this.drawBoard = function () {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.boardWidth; ++i) {
            for (let j = 0; j < this.boardHeight; ++j) {
                this.drawHexagon(
                    i,
                    j,
                    false
                );
            }
        }
    };



    this.drawHexagon = function (i, j, cursor) {
        cursor = cursor || false;

        let x = i * this.hexRectangleWidth + ((j % 2) * this.hexRadius);
        let y = j * (this.sideLength + this.hexHeight);

        this.ctx.beginPath();
        this.ctx.moveTo(x + this.hexRadius, y);
        this.ctx.lineTo(x + this.hexRectangleWidth, y + this.hexHeight);
        this.ctx.lineTo(x + this.hexRectangleWidth, y + this.hexHeight + this.sideLength);
        this.ctx.lineTo(x + this.hexRadius, y + this.hexRectangleHeight);
        this.ctx.lineTo(x, y + this.sideLength + this.hexHeight);
        this.ctx.lineTo(x, y + this.hexHeight);
        this.ctx.closePath();

        let old_fill_color = this.ctx.fillStyle;
        if (cursor) {
            let color = this.game.cursor_color;
            this.ctx.fillStyle = color;
            this.ctx.fill();

        } else {
            //see if part is there
            if (this.game.parts.get_part(i, j)) {
                let part = this.game.parts.get_part(i, j);
                let color = part.get_color();
                this.ctx.fillStyle = color;
                this.ctx.fill();
                part.stamp( x, y);
            }
        }
        this.ctx.stroke();
        this.ctx.fillStyle = old_fill_color;
    }
}