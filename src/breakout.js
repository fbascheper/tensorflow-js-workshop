window.ordina = {};

ordina.breakout ||
function () {

    const canvasContainer = document.getElementById("breakout-container");
    const canvas = document.getElementById("breakout");

    if (canvasContainer.clientWidth) {
        canvas.width = canvasContainer.clientWidth;
    }

    let game = {},
        ctx = canvas.getContext("2d");

    game.rightRequested = false;
    game.leftRequested = false;

    game.addEventListeners = function () {
        if (window.addEventListener) {
            window.addEventListener("keydown", game.handleKeyDown, false);
            window.addEventListener("keyup", game.handleKeyUp, false);
        } else {
            alert("Cannot add event listener")
        }
    };

    game.keyPressed = function (keyCode) {
        let result = false;

        if (keyCode === 39) {
            game.rightRequested = true;
            game.leftRequested = false;
            result = true;
        } else if (keyCode === 37) {
            game.leftRequested = true;
            game.rightRequested = false;
            result = true;
        }

        return result;
    };

    game.keyRelayed = function (keyCode) {
        let result = false;

        if (keyCode === 39) {
            game.rightRequested = false;
            result = true;
        } else if (keyCode === 37) {
            game.leftRequested = false;
            result = true;
        }

        return result;
    };

    game.handleKeyDown = function (evt) {
        if (!evt) {
            evt = window.event;
        }
        if (game.keyPressed(evt.keyCode)) {
            if (evt.preventDefault) evt.preventDefault();
        }
    };

    game.handleKeyUp = function (evt) {
        if (!evt) {
            evt = window.event;
        }
        if (game.keyRelayed(evt.keyCode)) {
            if (evt.preventDefault) evt.preventDefault();
        }
    };

    game.setupGame = function () {
        game.gameFinished = false;
        game.endGameMessage = undefined;

        game.ballRadius = 10;
        game.paddleHeight = 10;
        game.paddleWidth = 75;
        game.brickWidth = 75;
        game.brickHeight = 20;
        game.brickPadding = 10;
        game.brickOffsetTop = 30;
        game.brickOffsetLeft = 30;


        game.score = 0;
        game.lives = 3;

        game.paddleX = (canvas.width - game.paddleWidth) / 2;
        game.x = canvas.width / 2;
        game.y = canvas.height - 30;
        game.dx = 2;
        game.dy = -2;

        game.brickRowCount = Math.floor(canvas.width / (game.brickWidth + game.brickPadding));
        game.brickColumnCount = 3;

        game.bricks = [];
        for (let c = 0; c < game.brickColumnCount; c++) {
            game.bricks[c] = [];
            for (let r = 0; r < game.brickRowCount; r++) {
                game.bricks[c][r] = {x: 0, y: 0, status: 1};
            }
        }
    };

    game.collisionDetection = function () {
        for (let c = 0; c < game.brickColumnCount; c++) {
            for (let r = 0; r < game.brickRowCount; r++) {
                let b = game.bricks[c][r];
                if (b.status === 1) {
                    if (game.x > b.x && game.x < b.x + game.brickWidth && game.y > b.y && game.y < b.y + game.brickHeight) {
                        game.dy = -game.dy;
                        b.status = 0;
                        game.score++;
                        if (game.score === game.brickRowCount * game.brickColumnCount) {
                            game.endGame("YOU WIN !!!");
                        }
                    }
                }
            }
        }
    };

    game.drawBall = function () {
        ctx.beginPath();
        ctx.arc(game.x, game.y, game.ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    };

    game.drawPaddle = function () {
        ctx.beginPath();
        ctx.rect(game.paddleX, canvas.height - game.paddleHeight, game.paddleWidth, game.paddleHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    };

    game.drawBricks = function () {
        for (let c = 0; c < game.brickColumnCount; c++) {
            for (let r = 0; r < game.brickRowCount; r++) {
                if (game.bricks[c][r].status === 1) {
                    const brickX = (r * (game.brickWidth + game.brickPadding)) + game.brickOffsetLeft;
                    const brickY = (c * (game.brickHeight + game.brickPadding)) + game.brickOffsetTop;
                    game.bricks[c][r].x = brickX;
                    game.bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, game.brickWidth, game.brickHeight);
                    ctx.fillStyle = "#0095DD";
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    };

    game.drawScore = function () {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Score: " + game.score, 8, 20);
    };

    game.drawLives = function () {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Lives: " + game.lives, canvas.width - 65, 20);
    };

    game.drawEndGameMessage = function () {
        ctx.save();

        ctx.font = "72px Arial";
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "magenta");
        gradient.addColorStop(0.5, "blue");
        gradient.addColorStop(1.0, "red");
        // Fill with gradient
        ctx.fillStyle = gradient;

        ctx.translate(Math.floor(canvas.width / 2), Math.floor(canvas.height / 3));
        ctx.rotate(-Math.PI / 8);
        ctx.textAlign = "center";
        ctx.fillText(game.endGameMessage, 8, Math.floor(canvas.height / 3));

        ctx.restore();
    };

    game.draw = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.drawBricks();
        game.drawBall();
        game.drawPaddle();
        game.drawScore();
        game.drawLives();

        if (game.gameFinished) {
            game.drawEndGameMessage();
        }

        if (game.gameStarted && !game.gameFinished) {
            game.collisionDetection();

            if (game.x + game.dx > canvas.width - game.ballRadius || game.x + game.dx < game.ballRadius) {
                game.dx = -game.dx;
            }
            if (game.y + game.dy < game.ballRadius) {
                game.dy = -game.dy;
            } else if (game.y + game.dy > canvas.height - game.ballRadius) {
                if (game.x > game.paddleX && game.x < game.paddleX + game.paddleWidth) {
                    game.dy = -game.dy;
                } else {
                    game.lives--;
                    if (!game.lives) {
                        game.endGame("GAME OVER !!!");
                    } else {
                        game.x = canvas.width / 2;
                        game.y = canvas.height - 30;
                        game.dx = 3;
                        game.dy = -3;
                        game.paddleX = (canvas.width - game.paddleWidth) / 2;
                    }
                }
            }

            if (game.rightRequested && game.paddleX < canvas.width - game.paddleWidth) {
                game.paddleX += 7;
            } else if (game.leftRequested && game.paddleX > 0) {
                game.paddleX -= 7;
            }

            game.x += game.dx;
            game.y += game.dy;
        }

        requestAnimationFrame(game.draw);
    };

    game.endGame = function (message) {
        game.gameFinished = true;
        game.endGameMessage = message;
    };

    game.startGamePlay = function () {
        if (!game.gameStarted || game.gameFinished) {
            game.setupGame();
            game.gameStarted = true;
        }
    };

    game.exportFunctionCalls = function () {
        ordina.breakout = {};
        ordina.breakout.startGamePlay = game.startGamePlay;
        ordina.breakout.keyPressed = game.keyPressed;
    };


    game.init = function () {
        game.addEventListeners();
        game.exportFunctionCalls();
        game.setupGame();

        game.gameStarted = false;

        game.draw();
    };

    game.init();
}();
