class StarField {
  constructor(container, numStars = 100) {
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
    this.linesCanvas.style.position = 'absolute';
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

    const size = (Math.random() * 3 + 1) * 1.2;
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
      twinkleSpeed: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
      currentX: x,
      currentY: y,
      velocityX: (Math.random() - 0.5) * 0.05,
      velocityY: (Math.random() - 0.5) * 0.05,
    };

    this.stars.push(star);
    this.container.appendChild(star);
  }

  animate() {
    const animateFrame = () => {
      this.stars.forEach((star) => {
        const data = star.starData;
        data.phase += 0.02 * data.twinkleSpeed;

        data.currentX += data.velocityX;
        data.currentY += data.velocityY;

        const margin = 10;
        if (data.currentX < -margin || data.currentX > 100 + margin ||
            data.currentY < -margin || data.currentY > 100 + margin) {

          const side = Math.floor(Math.random() * 4);

          switch(side) {
            case 0:
              data.currentX = Math.random() * 100;
              data.currentY = -5;
              break;
            case 1:
              data.currentX = 105;
              data.currentY = Math.random() * 100;
              break;
            case 2:
              data.currentX = Math.random() * 100;
              data.currentY = 105;
              break;
            case 3:
              data.currentX = -5;
              data.currentY = Math.random() * 100;
              break;
          }

          data.velocityX = (Math.random() - 0.5) * 0.05;
          data.velocityY = (Math.random() - 0.5) * 0.05;
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

    this.ctx.clearRect(0, 0, this.linesCanvas.width, this.linesCanvas.height);

    const starPositions = this.stars.map(star => {
      const data = star.starData;
      return {
        x: (data.currentX / 100) * window.innerWidth,
        y: (data.currentY / 100) * window.innerHeight,
        data: data
      };
    });

    const maxConnections = 2;
    starPositions.forEach((pos1, i) => {
      let connections = 0;
      for (let j = i + 1; j < starPositions.length && connections < maxConnections; j++) {
        const pos2 = starPositions[j];
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDistance = 200;
        if (distance < maxDistance) {
          const opacity = Math.max(0.0, 1 - distance / maxDistance);

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

    const mouseConnections = starPositions
      .map(pos => ({
        pos,
        distance: Math.sqrt((this.mouseX - pos.x) ** 2 + (this.mouseY - pos.y) ** 2)
      }))
      .filter(item => item.distance < 150)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    mouseConnections.forEach(({ pos, distance }) => {
      const opacity = Math.max(0.0, 1 - distance / 150);

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
