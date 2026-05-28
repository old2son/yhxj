type StarPoint = {
    x: number;
    y: number;
    size: number;
    alpha: number;
};

type Bullet = {
    x: number;
    y: number;
    radius: number;
    speed: number;
};

type Asteroid = {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
};

type Particle = {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    alpha: number;
    decay: number;
    color: string;
};

type PlayerShip = {
    x: number;
    targetX: number;
    y: number;
    width: number;
    height: number;
};

Page({
    data: {
        score: 0,
        livesText: '♥♥♥',
        controlButtonText: '开始游戏',
        guideVisible: true,
        gameOverVisible: false,
        finalScore: 0,
    },

    canvasNode: null as any,
    ctx: null as any,
    dpr: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    stageRect:
        null as WechatMiniprogram.BoundingClientRectCallbackResult | null,
    loopTimer: 0 as number | undefined,
    backgroundStars: [] as StarPoint[],
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    player: {
        x: 0,
        targetX: 0,
        y: 0,
        width: 52,
        height: 28,
    } as PlayerShip,
    score: 0,
    lives: 3,
    isPlaying: false,
    hasStarted: false,
    spawnCounter: 0,
    shootCounter: 0,

    onReady() {
        this.initCanvas();
    },

    onShow() {
        const tabBar =
            typeof this.getTabBar === 'function' ? this.getTabBar() : null;
        if (tabBar && typeof (tabBar as any).setActive === 'function') {
            (tabBar as any).setActive('/pages/game/index');
        }
    },

    onHide() {
        if (this.isPlaying) {
            this.pauseGame();
        }
    },

    onUnload() {
        this.stopLoop();
    },

    initCanvas() {
        const query = wx.createSelectorQuery();
        query.select('#gameCanvas').fields({ node: true, size: true });
        query.select('#gameStage').boundingClientRect();
        query.exec((res) => {
            const canvasInfo = res[0] as {
                node: any;
                width: number;
                height: number;
            };
            const stageRect =
                res[1] as WechatMiniprogram.BoundingClientRectCallbackResult;

            if (!canvasInfo || !canvasInfo.node) {
                return;
            }

            let pixelRatio = wx.getSystemInfoSync().pixelRatio || 1;

            const canvas = canvasInfo.node;
            const ctx = canvas.getContext('2d');

            canvas.width = canvasInfo.width * pixelRatio;
            canvas.height = canvasInfo.height * pixelRatio;
            ctx.scale(pixelRatio, pixelRatio);

            this.canvasNode = canvas;
            this.ctx = ctx;
            this.dpr = pixelRatio;
            this.canvasWidth = canvasInfo.width;
            this.canvasHeight = canvasInfo.height;
            this.stageRect = stageRect;

            this.generateStars();
            this.resetScene();
            this.drawGame();
        });
    },

    generateStars() {
        const stars: StarPoint[] = [];
        for (let index = 0; index < 40; index += 1) {
            stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.7 + 0.2,
            });
        }
        this.backgroundStars = stars;
    },

    resetScene() {
        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        this.spawnCounter = 0;
        this.shootCounter = 0;
        this.score = 0;
        this.lives = 3;
        this.player.x = this.canvasWidth / 2;
        this.player.targetX = this.player.x;
        this.player.y = this.canvasHeight - 64;

        this.setData({
            score: 0,
            livesText: '♥♥♥',
            finalScore: 0,
            gameOverVisible: false,
        });
    },

    toggleGame() {
        if (!this.ctx) {
            this.initCanvas();
            return;
        }

        if (this.isPlaying) {
            this.pauseGame();
            return;
        }

        this.hasStarted = true;
        this.isPlaying = true;
        this.setData({
            guideVisible: false,
            controlButtonText: '暂停游戏',
        });
        this.startLoop();
    },

    pauseGame() {
        this.isPlaying = false;
        this.stopLoop();
        this.setData({
            controlButtonText: '继续游戏',
        });
    },

    restartGame() {
        this.resetScene();
        this.hasStarted = true;
        this.isPlaying = true;
        this.setData({
            guideVisible: false,
            gameOverVisible: false,
            controlButtonText: '暂停游戏',
        });
        this.startLoop();
    },

    startLoop() {
        this.stopLoop();
        this.loopTimer = setInterval(() => {
            this.updateGame();
            this.drawGame();
        }, 16);
    },

    stopLoop() {
        if (this.loopTimer) {
            clearInterval(this.loopTimer);
            this.loopTimer = undefined;
        }
    },

    handleTouch(event: WechatMiniprogram.TouchEvent) {
        if (!this.isPlaying || !this.stageRect) {
            return;
        }

        const touch = event.touches[0] || event.changedTouches[0];
        if (!touch) {
            return;
        }

        const nextX = touch.clientX - this.stageRect.left;
        const halfWidth = this.player.width / 2;

        this.player.targetX = Math.max(
            halfWidth,
            Math.min(this.canvasWidth - halfWidth, nextX),
        );
    },

    updateGame() {
        if (!this.isPlaying) {
            return;
        }

        this.player.x += (this.player.targetX - this.player.x) * 0.22;

        this.shootCounter += 1;
        if (this.shootCounter >= 12) {
            this.bullets.push({
                x: this.player.x,
                y: this.player.y - 12,
                radius: 4,
                speed: 12,
            });
            this.shootCounter = 0;
        }

        this.spawnCounter += 1;
        const spawnLimit = Math.max(24, 56 - Math.floor(this.score / 4) * 2);
        if (this.spawnCounter >= spawnLimit) {
            this.spawnAsteroid();
            this.spawnCounter = 0;
        }

        for (let index = this.bullets.length - 1; index >= 0; index -= 1) {
            const bullet = this.bullets[index];
            bullet.y -= bullet.speed;
            if (bullet.y < -20) {
                this.bullets.splice(index, 1);
            }
        }

        for (let index = this.asteroids.length - 1; index >= 0; index -= 1) {
            const asteroid = this.asteroids[index];
            asteroid.x += asteroid.speedX;
            asteroid.y += asteroid.speedY;
            asteroid.rotation += asteroid.rotationSpeed;

            if (asteroid.y - asteroid.radius > this.canvasHeight + 20) {
                this.asteroids.splice(index, 1);
                this.loseLife();
                continue;
            }

            let destroyed = false;
            for (
                let bulletIndex = this.bullets.length - 1;
                bulletIndex >= 0;
                bulletIndex -= 1
            ) {
                const bullet = this.bullets[bulletIndex];
                const distance = Math.hypot(
                    bullet.x - asteroid.x,
                    bullet.y - asteroid.y,
                );
                if (distance < bullet.radius + asteroid.radius) {
                    this.createExplosion(asteroid.x, asteroid.y, '#f43f5e');
                    this.asteroids.splice(index, 1);
                    this.bullets.splice(bulletIndex, 1);
                    this.score += 1;
                    this.setData({
                        score: this.score,
                    });
                    destroyed = true;
                    break;
                }
            }

            if (destroyed) {
                continue;
            }

            const distanceToPlayer = Math.hypot(
                this.player.x - asteroid.x,
                this.player.y - asteroid.y,
            );
            if (distanceToPlayer < asteroid.radius + this.player.width * 0.35) {
                this.createExplosion(asteroid.x, asteroid.y, '#f59e0b');
                this.asteroids.splice(index, 1);
                this.loseLife();
            }
        }

        for (let index = this.particles.length - 1; index >= 0; index -= 1) {
            const particle = this.particles[index];
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.alpha -= particle.decay;
            if (particle.alpha <= 0) {
                this.particles.splice(index, 1);
            }
        }
    },

    spawnAsteroid() {
        const radius = Math.random() * 14 + 12;
        this.asteroids.push({
            x: Math.random() * (this.canvasWidth - radius * 2) + radius,
            y: -radius,
            radius,
            speedX: (Math.random() - 0.5) * 1.2,
            speedY: Math.random() * 2 + 2.2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
        });
    },

    createExplosion(x: number, y: number, color: string) {
        for (let index = 0; index < 12; index += 1) {
            this.particles.push({
                x,
                y,
                size: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 6,
                speedY: (Math.random() - 0.5) * 6,
                alpha: 1,
                decay: Math.random() * 0.05 + 0.02,
                color,
            });
        }
    },

    loseLife() {
        this.lives -= 1;
        const heartMap = ['', '♥', '♥♥', '♥♥♥'];
        this.setData({
            livesText: heartMap[Math.max(0, this.lives)],
        });

        if (this.lives <= 0) {
            this.gameOver();
        }
    },

    gameOver() {
        this.isPlaying = false;
        this.stopLoop();
        this.setData({
            gameOverVisible: true,
            finalScore: this.score,
            controlButtonText: '开始游戏',
        });
    },

    drawGame() {
        if (!this.ctx) {
            return;
        }

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        const background = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        background.addColorStop(0, '#020617');
        background.addColorStop(1, '#0f172a');
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.backgroundStars.forEach((star) => {
            ctx.globalAlpha = star.alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        this.drawPlayer();
        this.drawBullets();
        this.drawAsteroids();
        this.drawParticles();
    },

    drawPlayer() {
        const ctx = this.ctx;
        const { x, y, width, height } = this.player;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y - 4, 11, Math.PI, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.65)';
        ctx.fill();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(x, y + 6, width / 2, height / 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y + 6, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.restore();
    },

    drawBullets() {
        const ctx = this.ctx;
        this.bullets.forEach((bullet) => {
            ctx.beginPath();
            ctx.fillStyle = '#22d3ee';
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawAsteroids() {
        const ctx = this.ctx;
        this.asteroids.forEach((asteroid) => {
            ctx.save();
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.rotation);

            ctx.beginPath();
            ctx.arc(0, 0, asteroid.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#475569';
            ctx.fill();
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                -asteroid.radius / 3,
                -asteroid.radius / 5,
                asteroid.radius / 4,
                0,
                Math.PI * 2,
            );
            ctx.fillStyle = '#334155';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
                asteroid.radius / 4,
                asteroid.radius / 3,
                asteroid.radius / 5,
                0,
                Math.PI * 2,
            );
            ctx.fillStyle = '#334155';
            ctx.fill();
            ctx.restore();
        });
    },

    drawParticles() {
        const ctx = this.ctx;
        this.particles.forEach((particle) => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, particle.alpha);
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    },

    goHome() {
        wx.switchTab({
            url: '/pages/index/index',
        });
    },

    goExplore() {
        wx.switchTab({
            url: '/pages/explore/index',
        });
    },
});
