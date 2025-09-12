class StarField {
  // Configuration constants
  static CONFIG = {
    DEFAULT_STAR_COUNT: 150,
    STAR_SIZE_MULTIPLIER: 1.2,
    STAR_SIZE_BASE: 3,
    STAR_SIZE_MIN: 1,
    TWINKLE_SPEED_MIN: 1,
    TWINKLE_SPEED_MAX: 2,
    VELOCITY_MULTIPLIER: 0.05,
    MARGIN_BUFFER: 10,
    RESPAWN_MARGIN: 5,
    MAX_CONNECTIONS: 2,
    CONNECTION_DISTANCE_MAX: 200,
    MOUSE_CONNECTION_DISTANCE: 150,
    MOUSE_CONNECTIONS_MAX: 3,
    PHASE_INCREMENT: 0.02
  };

  constructor(container, numStars = StarField.CONFIG.DEFAULT_STAR_COUNT) {
    this.container = container;
    this.numStars = numStars;
    this.stars = [];
    this.linesCanvas = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseMoved = false;
    this.init();
  }

  init() {
    this.container.innerHTML = '';

    this.createLinesCanvas();

    for (let i = 0; i < this.numStars; i++) {
      this.createStar();
    }

    this.animate();
  }

  createLinesCanvas() {
    this.linesCanvas = document.createElement('canvas');
    this.linesCanvas.className = 'star-lines';
    this.linesCanvas.width = window.innerWidth;
    this.linesCanvas.height = window.innerHeight;
    this.linesCanvas.style.position = 'fixed';
    this.linesCanvas.style.top = '0';
    this.linesCanvas.style.left = '0';
    this.linesCanvas.style.pointerEvents = 'none';
    this.linesCanvas.style.zIndex = '1';

    this.container.appendChild(this.linesCanvas);
    this.ctx = this.linesCanvas.getContext('2d');

    window.addEventListener('resize', () => {
      this.linesCanvas.width = window.innerWidth;
      this.linesCanvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.mouseMoved = true;
      this.drawLines();
    });
  }

  createStar() {
    const star = document.createElement('div');
    star.className = 'star';

    const config = StarField.CONFIG;
    const size = (Math.random() * (config.STAR_SIZE_BASE - config.STAR_SIZE_MIN) + config.STAR_SIZE_MIN) * config.STAR_SIZE_MULTIPLIER;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = Math.random() * 4;
    const duration = Math.random() * 3 + 2;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.animationDelay = `${delay}s`;
    star.style.animationDuration = `${duration}s`;

    star.starData = {
      x: x,
      y: y,
      size: size,
      twinkleSpeed: Math.random() * (config.TWINKLE_SPEED_MAX - config.TWINKLE_SPEED_MIN) + config.TWINKLE_SPEED_MIN,
      phase: Math.random() * Math.PI * 2,
      currentX: x,
      currentY: y,
      velocityX: (Math.random() - 0.5) * config.VELOCITY_MULTIPLIER,
      velocityY: (Math.random() - 0.5) * config.VELOCITY_MULTIPLIER,
    };

    this.stars.push(star);
    this.container.appendChild(star);
  }

  animate() {
    const animateFrame = () => {
      const config = StarField.CONFIG;

      this.stars.forEach((star) => {
        const data = star.starData;
        data.phase += config.PHASE_INCREMENT * data.twinkleSpeed;

        data.currentX += data.velocityX;
        data.currentY += data.velocityY;

        const margin = config.MARGIN_BUFFER;
        if (data.currentX < -margin || data.currentX > 100 + margin ||
            data.currentY < -margin || data.currentY > 100 + margin) {

          const side = Math.floor(Math.random() * 4);
          const respawnMargin = config.RESPAWN_MARGIN;

          switch(side) {
            case 0:
              data.currentX = Math.random() * 100;
              data.currentY = -respawnMargin;
              break;
            case 1:
              data.currentX = 100 + respawnMargin;
              data.currentY = Math.random() * 100;
              break;
            case 2:
              data.currentX = Math.random() * 100;
              data.currentY = 100 + respawnMargin;
              break;
            case 3:
              data.currentX = -respawnMargin;
              data.currentY = Math.random() * 100;
              break;
          }

          data.velocityX = (Math.random() - 0.5) * config.VELOCITY_MULTIPLIER;
          data.velocityY = (Math.random() - 0.5) * config.VELOCITY_MULTIPLIER;
        }

        const pixelX = ((data.currentX - data.x) / 100) * window.innerWidth;
        const pixelY = ((data.currentY - data.y) / 100) * window.innerHeight;

        star.style.transform = `translate(${pixelX}px, ${pixelY}px)`;
      });

      this.drawLines();
      this.mouseMoved = false;

      requestAnimationFrame(animateFrame);
    };

    animateFrame();
  }

  drawLines() {
    if (!this.ctx) return;

    const config = StarField.CONFIG;
    this.ctx.clearRect(0, 0, this.linesCanvas.width, this.linesCanvas.height);

    const starPositions = this.stars.map(star => {
      const data = star.starData;
      return {
        x: (data.currentX / 100) * window.innerWidth,
        y: (data.currentY / 100) * window.innerHeight,
        data: data
      };
    });

    // Draw connections between nearby stars
    starPositions.forEach((pos1, i) => {
      let connections = 0;
      for (let j = i + 1; j < starPositions.length && connections < config.MAX_CONNECTIONS; j++) {
        const pos2 = starPositions[j];
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.CONNECTION_DISTANCE_MAX) {
          const opacity = Math.max(0.0, 1 - distance / config.CONNECTION_DISTANCE_MAX);

          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(pos1.x, pos1.y);
          this.ctx.lineTo(pos2.x, pos2.y);
          this.ctx.stroke();
          connections++;
        }
      }
    });

    // Draw connections from mouse to nearby stars
    const mouseConnections = starPositions
      .map(pos => ({
        pos,
        distance: Math.sqrt((this.mouseX - pos.x) ** 2 + (this.mouseY - pos.y) ** 2)
      }))
      .filter(item => item.distance < config.MOUSE_CONNECTION_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, config.MOUSE_CONNECTIONS_MAX);

    mouseConnections.forEach(({ pos, distance }) => {
      const opacity = Math.max(0.0, 1 - distance / config.MOUSE_CONNECTION_DISTANCE);

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(this.mouseX, this.mouseY);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const starContainer = document.querySelector('.stars');
  if (starContainer) {
    new StarField(starContainer, 150);
  }
});
