document.addEventListener("DOMContentLoaded", function () {

    const rertyButton = document.getElementById('retry-button');
    rertyButton.addEventListener('click', function () {
        window.location.reload();
    });

    let gameMusicStarted = false;

    let music = new Howl({
        src: ['assets/music.mp3'],
        loop: true,
        volume: 0.5,
        preload: true,
    });

    music.play();

    let gameMusic = new Howl({
        src: ['assets/gameMusic.mp3'],
        loop: true,
        volume: 0.5,
        preload: true,
    });

    let winMusic = new Howl({
        src: ['assets/winMusic.mp3'],
        loop: true,
        volume: 0.5,
        preload: true,
    });

    let muerte = new Howl({
        src: ['assets/muerte.mp3'],
        volume: 0.5,
        preload: true,
    });

    let damageSound = new Howl({
        src: ['assets/damageSound.mp3'],
        volume: 0.5,
        preload: true,
    });

    let enemySound1 = new Howl({
        src: ['assets/enemySound1.mp3'],
        volume: 0.5,
        preload: true,
    });

    let enemySound2 = new Howl({
        src: ['assets/enemySound2.mp3'],
        volume: 0.5,
        preload: true,
    });

    let enemyDeath = new Howl({
        src: ['assets/enemyDeath.mp3'],
        volume: 0.5,
        preload: true,
    });

    let holySound = new Howl({
        src: ['assets/holySound.mp3'],
        volume: 0.8,
        preload: true,
    });


    let isPlaying = false;
    let introImage = true;

    const enemySounds = [enemySound1, enemySound2];


    const canvas = document.getElementById('juego');
    const ctx = canvas.getContext('2d');

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const startImage = new Image();
    startImage.src = 'assets/start.jpg';

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/room.png';

    const winImage = new Image();
    winImage.src = 'assets/win.png';

    const gameOverImage = new Image();
    gameOverImage.src = 'assets/gameover.png';

    const playerImage = new Image();
    playerImage.src = 'assets/isaac.png';

    const tearImage = new Image();
    tearImage.src = 'assets/tear.png';

    const enemyImage = new Image();
    enemyImage.src = 'assets/enemy1.png';

    const enemyTearImage = new Image();
    enemyTearImage.src = 'assets/redTear.png';

    const enemy2Image = new Image();
    enemy2Image.src = 'assets/enemy2.png';

    let shootCooldown = 400;

    let canShoot = true;

    const esquina1 = { x: 120, y: 100 };
    const esquina2 = { x: 800, y: 400 };
    const esquina3 = { x: 800, y: 100 };
    const esquina4 = { x: 120, y: 400 };

    function getRandomCorner() {
        const corners = [esquina1, esquina2, esquina3, esquina4];
        const randomIndex = Math.floor(Math.random() * corners.length);
        return corners[randomIndex];
    }

    const player = {
        x: 450,
        y: 250,
        width: 70,
        height: 80,
        speed: 5,
        dx: 0,
        dy: 0,
        health: 3,
        cooldown: false
    };

    const enemy = {
        x: 120,
        y: 100,
        width: 70,
        height: 60,
        dx: 0,
        dy: 0,
        health: 3
    }

    const enemy2 = {
        x: 800,
        y: 400,
        width: 70,
        height: 80,
        dx: 0,
        dy: 0,
        health: 3,
        speed: 2,
        damage: 1,
        isDead: false
    }

    const randomCorner1 = getRandomCorner();
    enemy.x = randomCorner1.x;
    enemy.y = randomCorner1.y;

    const randomCorner2 = getRandomCorner();
    enemy2.x = randomCorner2.x;
    enemy2.y = randomCorner2.y;


    function checkBorderCollision() {
        const halfPlayerWidth = player.width / 2;
        const halfPlayerHeight = player.height / 2;

        //COLISION BORDE IZQUIERDO
        if (player.x - halfPlayerWidth < 35) {
            player.x = halfPlayerWidth + 35;
        }

        //COLISION BORDE ARRIBA
        if (player.y - halfPlayerHeight < 0) {
            player.y = halfPlayerHeight;
        }

        //COLISION BORDE DERECHO
        if (player.x + halfPlayerWidth > canvasWidth - 110) {
            player.x = canvasWidth - halfPlayerWidth - 110;
        }

        //COLISION BORDE ABAJO
        if (player.y + halfPlayerHeight > canvasHeight - 130) {
            player.y = canvasHeight - halfPlayerHeight - 130;
        }
    }

    function checkProjectileCollision(tear, enemy) {
        if (!tear || !enemy || !enemy2) {
            return false;
        }

        return (
            tear.x < enemy.x + enemy.width &&
            tear.x + tear.width > enemy.x &&
            tear.y < enemy.y + enemy.height &&
            tear.y + tear.height > enemy.y
        );
    }

    function checkEnemyProjectileCollision(projectile, player) {
        return (
            projectile.x < player.x + player.width &&
            projectile.x + projectile.width > player.x &&
            projectile.y < player.y + player.height &&
            projectile.y + projectile.height > player.y

        );
    }



    function checkCollision(tear, enemy) {
        checkBorderCollision();

        if (checkProjectileCollision(tear, enemy)) {
            console.log('Colisión detectada');
            enemy.health--;

            if (enemy.health <= 0) {
                console.log('Enemigo 1 derrotado');
                enemyDeath.play();
            }
            removeProjectile(tear);
        }
    }

    function checkCollisionOnEnemy2(tear, enemy2) {
        checkBorderCollision();

        if (!enemy2.isDead && checkProjectileCollision(tear, enemy2)) {
            console.log('Colisión detectada enemigo 2');
            enemy2.health--;

            if (enemy2.health <= 0) {
                console.log('Enemigo 2 derrotado');
                enemyDeath.play();
                enemy2.isDead = true;
            }
            removeProjectile(tear);
        }
    }

    const tears = [];

    const enemyTears = [];

    const enemyShootCooldown = 2000;

    let enemyCanShoot = true;


    function drawPlayer() {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

        const healthBarWidth = (player.health / 3) * player.width;
        const healthBarX = player.x;
        const healthBarY = player.y + 85;

        ctx.fillStyle = '#222';
        ctx.fillRect(healthBarX, healthBarY, player.width, 10);

        ctx.fillStyle = '#22ff00';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, 10);
    }

    function drawEnemy() {
        if (enemy.health > 0) {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);

            const healthBarWidth = (enemy.health / 3) * enemy.width;
            const healthBarX = enemy.x;
            const healthBarY = enemy.y + 70;

            ctx.fillStyle = '#222';
            ctx.fillRect(healthBarX, healthBarY, enemy.width, 10);

            ctx.fillStyle = '#ff0000';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth, 10);
        }
    }

    function drawEnemy2() {
        if (enemy2.health > 0) {
            ctx.drawImage(enemy2Image, enemy2.x, enemy2.y, enemy2.width, enemy2.height);

            const healthBarWidth = (enemy2.health / 3) * enemy2.width;
            const healthBarX = enemy2.x;
            const healthBarY = enemy2.y + 85;

            ctx.fillStyle = '#222';
            ctx.fillRect(healthBarX, healthBarY, enemy2.width, 10);

            ctx.fillStyle = '#ff0000';
            ctx.fillRect(healthBarX, healthBarY, healthBarWidth, 10);
        }
    }



    function drawProjectiles() {
        for (const tear of tears) {
            ctx.drawImage(tearImage, tear.x, tear.y, tear.width, tear.height);
        }
    }

    function drawEnemyTears() {
        for (const projectile of enemyTears) {
            ctx.drawImage(enemyTearImage, projectile.x, projectile.y, projectile.width, projectile.height);
        }
    }

    function updateProjectiles() {
        for (const tear of tears) {
            if (tear.timer < tear.frames) {
                tear.x += tear.dx;
                tear.y += tear.dy;
                tear.timer++;


                if (checkCollision(tear, enemy)) {

                    removeProjectile(tear);

                }

                if (checkCollisionOnEnemy2(tear, enemy2)) {
                    removeProjectile(tear);
                }
            } else {

                removeProjectile(tear);
            }
        }
    }


    function updateEnemyTears() {
        for (const projectile of enemyTears) {
            if (projectile.timer < projectile.frames) {

                const directionX = player.x + player.width / 2 - (projectile.x + projectile.width / 2);
                const directionY = player.y + player.height / 2 - (projectile.y + projectile.height / 2);


                const length = Math.sqrt(directionX ** 2 + directionY ** 2);
                projectile.dx = (directionX / length) * projectile.speed;
                projectile.dy = (directionY / length) * projectile.speed;


                projectile.x += projectile.dx;
                projectile.y += projectile.dy;
                projectile.timer++;

                if (checkEnemyProjectileCollision(projectile, player)) {

                    player.health -= 1;
                    damageSound.play();
                    player.cooldown = true;
                    setTimeout(() => {
                        player.cooldown = false;
                    }, 1000);


                    removeEnemyProjectile(projectile);

                }

            } else {

                removeEnemyProjectile(projectile);
            }
        }
    }

    function updateEnemy2() {
        if (!enemy2.isDead) {

            const dx = player.x - enemy2.x;
            const dy = player.y - enemy2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;

            enemy2.x += normalizedDx * enemy2.speed;
            enemy2.y += normalizedDy * enemy2.speed;

            if (
                !player.cooldown &&
                enemy2.x < player.x + player.width &&
                enemy2.x + enemy2.width > player.x &&
                enemy2.y < player.y + player.height &&
                enemy2.y + enemy2.height > player.y
            ) {

                player.health -= enemy2.damage;
                damageSound.play();
                console.log("Colisión con enemy2");

                player.cooldown = true;
                setTimeout(() => {
                    player.cooldown = false;
                }, 1000);

            }
        }
    }

    function removeProjectile(tearToRemove) {
        const index = tears.indexOf(tearToRemove);
        if (index !== -1) {
            tears.splice(index, 1);
        }
    }

    function removeEnemyProjectile(projectileToRemove) {
        const index = enemyTears.indexOf(projectileToRemove);
        if (index !== -1) {
            enemyTears.splice(index, 1);
        }
    }
    window.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'Enter':
                isPlaying = true;
                introImage = false;
                music.stop();
                gameMusic.play();

                break;
        }
    });

    if (gameMusicStarted) {

    }
    function update() {

        if (introImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(startImage, 0, 0, canvasWidth, canvasHeight);
        }

        if (isPlaying) {

            player.x += player.dx;
            player.y += player.dy;

            enemy.x += enemy.dx;
            enemy.y += enemy.dy;

            enemy2.x += enemy2.dx;
            enemy2.y += enemy2.dy;

            checkCollision();

            updateProjectiles();

            updateEnemyTears();

            updateEnemy2();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            drawPlayer();

            drawEnemy();

            drawEnemy2();

            drawProjectiles();

            drawEnemyTears();

            for (const projectile of enemyTears) {
                if (checkEnemyProjectileCollision(projectile, player)) {
                    player.health -= 1;

                    removeEnemyProjectile(projectile);

                }
            }

            if (player.health <= 0) {

                isPlaying = false;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(gameOverImage, 0, 0, canvasWidth, canvasHeight);

                console.log("Game Over");
                gameMusic.stop();
                muerte.play();
                rertyButton.style.display = 'flex';
            }

            if (enemy.health == 0 && enemy2.health == 0) {
                isPlaying = false;

                holySound.play();

                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    ctx.drawImage(winImage, 0, 0, canvasWidth, canvasHeight);
                }, 2000);


                console.log("Has ganao");
                gameMusic.stop();


                setTimeout(() => {
                    winMusic.play();
                    rertyButton.style.display = 'flex';
                }, 2000);

            }

            if (enemy.health <= 0) {
                enemyCanShoot = false;
            }
        }
    }

    function gameLoop() {

        update();
        requestAnimationFrame(gameLoop);

    }

    window.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'a':
                player.dx = -player.speed;
                break;
            case 'd':
                player.dx = player.speed;
                break;
            case 'w':
                player.dy = -player.speed;
                break;
            case 's':
                player.dy = player.speed;
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':

                if (canShoot) {
                    shootProjectile(event.key);
                    canShoot = false;
                    setTimeout(() => {
                        canShoot = true;
                    }, shootCooldown);
                }
                break;
        }
    });

    window.addEventListener('keyup', function (event) {
        switch (event.key) {
            case 'a':
            case 'd':
                player.dx = 0;
                break;
            case 'w':
            case 's':
                player.dy = 0;
                break;
        }
    });

    function shootProjectile(key) {
        const newTear = {
            x: (player.x + player.width / 2) - 12,
            y: (player.y + player.height / 2) - 12,
            width: 25,
            height: 25,
            speed: 7,
            dx: 0,
            dy: 0,
            timer: 0,
            frames: 60
        };


        switch (key) {
            case 'ArrowUp':
                newTear.dy = -newTear.speed;
                break;
            case 'ArrowDown':
                newTear.dy = newTear.speed;
                break;
            case 'ArrowLeft':
                newTear.dx = -newTear.speed;
                break;
            case 'ArrowRight':
                newTear.dx = newTear.speed;
                break;
        }

        tears.push(newTear);
    }


    function enemyAutoShoot() {
        if (enemyCanShoot) {
            shootProjectileAuto(enemy);
            enemyCanShoot = false;
            setTimeout(() => {
                enemyCanShoot = true;
            }, enemyShootCooldown);
        }
        setTimeout(enemyAutoShoot, 100);

    }

    enemyAutoShoot();

    function shootProjectileAuto(shooter) {
        if (isPlaying) {
            const newProjectile = {
                x: shooter.x + shooter.width / 2,
                y: shooter.y + shooter.height / 2,
                width: 25,
                height: 25,
                speed: 4,
                dx: 0,
                dy: 0,
                timer: 0,
                frames: 100
            };


            enemyTears.push(newProjectile);
            const randomEnemySound = getRandomEnemySound();
            randomEnemySound.play();
        }
    }

    function getRandomEnemySound() {
        const randomIndex = Math.floor(Math.random() * enemySounds.length);
        return enemySounds[randomIndex];
    }

    gameLoop();

});