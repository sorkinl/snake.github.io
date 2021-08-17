window.onload = function () {
  Particles.init({
    selector: ".background",
  });
};

function startGame() {
  const intro = document.getElementById("intro");
  intro.innerHTML = "<p>Waiting for your friend to join...</p>";
  let ip_port = "18.216.124.217:8080";
  let socket = new WebSocket(`ws://${ip_port}`);
  window.onbeforeunload = function () {
    websocket.onclose = function () {}; // disable onclose handler first
    socket.close();
  };
  socket.onopen = function (e) {
    intro.style.display = "none";
    const game = document.getElementById("game");
    game.style.display = "block";
    const board_border = "black";
    const board_background = "white";
    const snake_col = "lightblue";
    const snake_border = "darkblue";

    let snake = [];
    let snake2 = [];
    let score = 0;
    let score2 = 0;
    // True if changing direction
    let changing_direction = false;
    // Horizontal velocity
    let food_x;
    let food_y;
    let dx = 10;
    // Vertical velocity
    let dy = 0;

    var ended = false;

    // Get the canvas element
    const snakeboard = document.getElementById("snakeboard");
    // Return a two dimensional drawing context
    const snakeboard_ctx = snakeboard.getContext("2d");

    document.addEventListener("keydown", change_direction);

    // draw a border around the canvas
    function clear_board() {
      //  Select the colour to fill the drawing
      snakeboard_ctx.fillStyle = board_background;
      //  Select the colour for the border of the canvas
      snakeboard_ctx.strokestyle = board_border;
      // Draw a "filled" rectangle to cover the entire canvas
      snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
      // Draw a "border" around the entire canvas
      snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
    }

    // Draw the snake on the canvas
    function drawSnake() {
      // Draw each parta
      snake.forEach(drawSnakePart);
      snake2.forEach(drawSnakePart);
    }

    function drawFood() {
      snakeboard_ctx.fillStyle = "lightgreen";
      snakeboard_ctx.strokestyle = "darkgreen";
      snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
      snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
    }

    // Draw one snake part
    function drawSnakePart(snakePart) {
      // Set the colour of the snake part
      snakeboard_ctx.fillStyle = snake_col;
      // Set the border colour of the snake part
      snakeboard_ctx.strokestyle = snake_border;
      // Draw a "filled" rectangle to represent the snake part at the coordinates
      // the part is located
      snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
      // Draw a border around the snake part
      snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    }

    function has_game_ended() {
      if (ended == null) {
        return false;
      }
      //socket.close();
      return true;
    }

    function change_direction(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;

      // Prevent the snake from reversing

      if (changing_direction) return;
      changing_direction = true;
      const keyPressed = event.keyCode;
      const goingUp = dy === -10;
      const goingDown = dy === 10;
      const goingRight = dx === 10;
      const goingLeft = dx === -10;
      if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -10;
        dy = 0;
      }
      if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -10;
      }
      if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 10;
        dy = 0;
      }
      if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 10;
      }
    }

    function move_snake() {
      // Create the new Snake's head
      /* if (snake.length != 0) {
        var head;
        if (
          snake[0].x + dx <= 400 &&
          snake[0].y + dy <= 400 &&
          snake[0].x + dx >= 0 &&
          snake[0].y + dy >= 0
        ) {
          head = { x: snake[0].x + dx, y: snake[0].y + dy };
        } else if (snake[0].x + dx > 400) {
          head = { x: 0, y: snake[0].y + dy };
        } else if (snake[0].y + dy > 400) {
          head = { x: snake[0].x + dx, y: 0 };
        } else if (snake[0].x + dx <= 0) {
          head = { x: 400, y: snake[0].y + dy };
        } else if (snake[0].y + dy <= 0) {
          head = { x: snake[0].x + dx, y: 400 };
        }
        // Add the new head to the beginning of snake body
        snake.unshift(head);
        const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
        if (has_eaten_food) {
          // Increase score
          //score += 10;
          // Display score on screen
          document.getElementById("score").innerHTML = score;
          document.getElementById("score1").innerHTML = score2;
          // Generate new food location
        } else {
          // Remove the last part of snake body
          snake.pop();
        } */
      document.getElementById("score").innerHTML = score;
      document.getElementById("score1").innerHTML = score2;
      socket.send(JSON.stringify({ dx: dx, dy: dy }));
    }

    socket.onmessage = function (event) {
      try {
        console.log(event.data);
        snake = JSON.parse(event.data).snake1.snake;
        score = JSON.parse(event.data).snake1.score;
        snake2 = JSON.parse(event.data).snake2.snake;
        score2 = JSON.parse(event.data).snake2.score;
        food_x = JSON.parse(event.data).food.x;
        food_y = JSON.parse(event.data).food.y;

        ended = JSON.parse(event.data).ended;
      } catch (err) {
        console.log(err);
      }
      if (has_game_ended()) {
        document.getElementById("end").style.display = "block";
        document.getElementById("result").innerHTML =
          ended == "Lost" ? "Lost" : "Won";
        document.getElementById("game").style.display = "none";
      }

      changing_direction = false;
      clear_board();
      drawFood();
      move_snake();
      drawSnake();
    };

    socket.onclose = function (event) {
      console.log(event);
      if (event.wasClean) {
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log("[close] Connection died");
      }
    };

    socket.onerror = function (error) {
      console.log(`[error] ${error.message}`);
    };
  };
}
