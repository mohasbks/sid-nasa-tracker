/**
 * three-scene.js — Three.js 3D Earth + Starfield
 */

(function() {
  const canvas = document.getElementById('earth-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(120, 120);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.5;

  // Earth sphere
  const geo = new THREE.SphereGeometry(1, 48, 48);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x1a6b9a,
    emissive: 0x0a2233,
    specular: 0x4fc3f7,
    shininess: 60
  });
  const earth = new THREE.Mesh(geo, mat);
  scene.add(earth);

  // Atmosphere glow
  const atmGeo = new THREE.SphereGeometry(1.05, 48, 48);
  const atmMat = new THREE.MeshPhongMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.08,
    side: THREE.FrontSide
  });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  // Lights
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(5, 3, 5);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x112244, 0.8));

  // Starfield
  const starGeo = new THREE.BufferGeometry();
  const stars = new Float32Array(600 * 3);
  for (let i = 0; i < stars.length; i++) stars[i] = (Math.random() - 0.5) * 80;
  starGeo.setAttribute('position', new THREE.BufferAttribute(stars, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })));

  function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.004;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ── Hero Canvas Starfield ───────────────────────────────────────── */
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

  const STARS = Array.from({ length: 160 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.5 + 0.3,
    s: Math.random() * 0.3 + 0.1,
    o: Math.random()
  }));

  // Floating particles
  const PARTICLES = Array.from({ length: 25 }, () => ({
    x: Math.random() * 1000, y: Math.random() * 300,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.2,
    r: Math.random() * 2 + 1,
    color: ['#6c63ff','#00d4ff','#ff6b6b','#ffd700'][Math.floor(Math.random()*4)]
  }));

  let t = 0;
  function draw() {
    requestAnimationFrame(draw);
    t += 0.008;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Stars
    STARS.forEach(s => {
      const pulse = 0.5 + 0.5 * Math.sin(t * s.s + s.o * 10);
      ctx.globalAlpha = 0.3 + 0.7 * pulse;
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
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }
  draw();
})();
