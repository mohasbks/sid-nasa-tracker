/**
 * hero-canvas.js — Interactive background particles for SID Hero Section
 * Lightweight 2D canvas animation matching premium minimalist design
 */

(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const STARS = Array.from({ length: 80 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.0 + 0.2,
    s: Math.random() * 0.2 + 0.05,
    o: Math.random()
  }));

  // Muted matching accents
  const colors = ['#3b82f6', '#60a5fa', '#9CA3AF', '#F3F4F6'];

  // Floating particles
  const PARTICLES = Array.from({ length: 15 }, () => ({
    x: Math.random() * 800, y: Math.random() * 200,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.1,
    r: Math.random() * 1.5 + 0.5,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  let t = 0;
  function draw() {
    requestAnimationFrame(draw);
    t += 0.005;
    const W = canvas.width, H = canvas.height;
    if (W === 0 || H === 0) return;
    ctx.clearRect(0, 0, W, H);

    // Stars
    STARS.forEach(s => {
      const pulse = 0.5 + 0.5 * Math.sin(t * s.s + s.o * 10);
      ctx.globalAlpha = 0.25 + 0.5 * pulse;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    PARTICLES.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }
  draw();
})();
