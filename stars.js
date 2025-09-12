class StarField {
  static CONFIG = {
    STAR_COUNT: 150,
    SIZE_MULTIPLIER: 1.2,
    BASE_SIZE: 3,
    MIN_SIZE: 1,
    TWINKLE_MIN: 1,
    TWINKLE_MAX: 2,
    VELOCITY: 0.05,
    MARGIN: 10,
    RESPAWN: 5,
    MAX_CONNECTIONS: 2,
    CONNECTION_DISTANCE: 200,
    MOUSE_DISTANCE: 150,
    MOUSE_MAX: 3,
    PHASE_STEP: 0.02,
    SIDES: 4,
    ANIMATION_DELAY_MAX: 4,
    ANIMATION_DURATION_MIN: 2,
    ANIMATION_DURATION_RANGE: 3
  };

  constructor(container, count) {
    this.container = container;
    this.count = count || this.getResponsiveStarCount();
    this.stars = [];
    this.canvas = null;
    this.ctx = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseMoved = false;
    this.init();
  }

  getResponsiveStarCount() {
    const width = window.innerWidth;
    if (width < 768) return 50;
    if (width < 1024) return 100;
    return 150;
  }

  init() {
    this.container.innerHTML = '';
    this.setupCanvas();
    this.createStars();
    this.setupEvents();
    this.animate();
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'star-lines';
    this.resizeCanvas();
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      pointerEvents: 'none',
      zIndex: '1'
    });

    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.updateStarCount();
    });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.mouseMoved = true;
      this.drawLines();
    });
  }

  updateStarCount() {
    const newCount = this.getResponsiveStarCount();
    if (newCount !== this.count) {
      this.count = newCount;
      this.stars.forEach(star => star.remove());
      this.stars = [];
      this.createStars();
    }
  }

  createStars() {
    for (let i = 0; i < this.count; i++) {
      this.createStar();
    }
  }

  createStar() {
    const star = document.createElement('div');
    star.className = 'star';

    const config = StarField.CONFIG;
    const size = (Math.random() * (config.BASE_SIZE - config.MIN_SIZE) + config.MIN_SIZE) * config.SIZE_MULTIPLIER;
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    Object.assign(star.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${Math.random() * config.ANIMATION_DELAY_MAX}s`,
      animationDuration: `${Math.random() * config.ANIMATION_DURATION_RANGE + config.ANIMATION_DURATION_MIN}s`
    });

    star.starData = {
      x, y, size,
      twinkleSpeed: Math.random() * (config.TWINKLE_MAX - config.TWINKLE_MIN) + config.TWINKLE_MIN,
      phase: Math.random() * Math.PI * 2,
      currentX: x,
      currentY: y,
      velocityX: (Math.random() - 0.5) * config.VELOCITY,
      velocityY: (Math.random() - 0.5) * config.VELOCITY
    };

    this.stars.push(star);
    this.container.appendChild(star);
  }

  animate() {
    const frame = () => {
      this.updateStars();
      this.drawLines();
      this.mouseMoved = false;
      requestAnimationFrame(frame);
    };
    frame();
  }

  updateStars() {
    const config = StarField.CONFIG;

    this.stars.forEach(star => {
      const data = star.starData;
      data.phase += config.PHASE_STEP * data.twinkleSpeed;

      data.currentX += data.velocityX;
      data.currentY += data.velocityY;

      if (this.isOutOfBounds(data)) {
        this.respawnStar(data);
      }

      const pixelX = ((data.currentX - data.x) / 100) * window.innerWidth;
      const pixelY = ((data.currentY - data.y) / 100) * window.innerHeight;
      star.style.transform = `translate(${pixelX}px, ${pixelY}px)`;
    });
  }

  isOutOfBounds(data) {
    const margin = StarField.CONFIG.MARGIN;
    return data.currentX < -margin || data.currentX > 100 + margin ||
           data.currentY < -margin || data.currentY > 100 + margin;
  }

  respawnStar(data) {
    const config = StarField.CONFIG;
    const side = Math.floor(Math.random() * config.SIDES);
    const margin = config.RESPAWN;

    switch(side) {
      case 0: data.currentX = Math.random() * 100; data.currentY = -margin; break;
      case 1: data.currentX = 100 + margin; data.currentY = Math.random() * 100; break;
      case 2: data.currentX = Math.random() * 100; data.currentY = 100 + margin; break;
      case 3: data.currentX = -margin; data.currentY = Math.random() * 100; break;
    }

    data.velocityX = (Math.random() - 0.5) * config.VELOCITY;
    data.velocityY = (Math.random() - 0.5) * config.VELOCITY;
  }

  drawLines() {
    if (!this.ctx) return;

    const config = StarField.CONFIG;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const positions = this.getStarPositions();
    this.drawStarConnections(positions);
    this.drawMouseConnections(positions);
  }

  getStarPositions() {
    return this.stars.map(star => {
      const data = star.starData;
      return {
        x: (data.currentX / 100) * window.innerWidth,
        y: (data.currentY / 100) * window.innerHeight,
        data
      };
    });
  }

  drawStarConnections(positions) {
    const config = StarField.CONFIG;

    positions.forEach((pos1, i) => {
      let connections = 0;
      for (let j = i + 1; j < positions.length && connections < config.MAX_CONNECTIONS; j++) {
        const pos2 = positions[j];
        const distance = this.getDistance(pos1, pos2);

        if (distance < config.CONNECTION_DISTANCE) {
          this.drawLine(pos1, pos2, distance / config.CONNECTION_DISTANCE);
          connections++;
        }
      }
    });
  }

  drawMouseConnections(positions) {
    const config = StarField.CONFIG;
    const connections = positions
      .map(pos => ({
        pos,
        distance: this.getDistance({x: this.mouseX, y: this.mouseY}, pos)
      }))
      .filter(item => item.distance < config.MOUSE_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, config.MOUSE_MAX);

    connections.forEach(({ pos, distance }) => {
      this.drawLine({x: this.mouseX, y: this.mouseY}, pos, distance / config.MOUSE_DISTANCE);
    });
  }

  getDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  drawLine(from, to, normalizedDistance) {
    const opacity = Math.max(0, 1 - normalizedDistance);

    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.stars');
  if (container) new StarField(container);
});
