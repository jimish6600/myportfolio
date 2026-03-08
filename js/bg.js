/* ── Three.js Background ─────────────────────────────────── */
const Background = (() => {

  let renderer, scene, camera, particles, heroMesh, clock;
  let mouse = { x: 0, y: 0 };
  let shapes = [];

  function init() {
    const canvas = document.getElementById('bg-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 55;
    clock = new THREE.Clock();

    buildParticles();
    buildShapes();
    buildHeroOrb();

    document.addEventListener('mousemove', e => {
      mouse.x = (e.clientX / innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / innerHeight - 0.5) * 2;
    });
    window.addEventListener('resize', onResize);
    animate();
  }

  function buildParticles() {
    const N = 2200;
    const pos    = new Float32Array(N * 3);
    const cols   = new Float32Array(N * 3);
    const speeds = new Float32Array(N);
    const palette = [[0.42,0.39,1],[0,0.83,1],[1,0.4,0.52],[0.2,0.9,0.7]];

    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random()-0.5)*220;
      pos[i*3+1] = (Math.random()-0.5)*220;
      pos[i*3+2] = (Math.random()-0.5)*110;
      speeds[i]  = 0.1 + Math.random() * 0.4;
      const c = palette[Math.floor(Math.random()*palette.length)];
      cols[i*3]=c[0]; cols[i*3+1]=c[1]; cols[i*3+2]=c[2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(cols, 3));
    geo.setAttribute('speed',    new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.38, vertexColors: true,
      transparent: true, opacity: 0.7,
      sizeAttenuation: true,
    });
    particles = new THREE.Points(geo, mat);
    scene.add(particles);
  }

  function buildShapes() {
    const defs = [
      { geo: new THREE.IcosahedronGeometry(7,1),    color:0x6c63ff, pos:[ 32, 22,-25], rot:[.003,.005,.002] },
      { geo: new THREE.OctahedronGeometry(5,0),     color:0x00d4ff, pos:[-38,-18,-32], rot:[.004,.003,.006] },
      { geo: new THREE.TorusGeometry(4,1.2,8,20),   color:0xff6584, pos:[ 42,-28,-28], rot:[.005,.002,.004] },
      { geo: new THREE.TetrahedronGeometry(5,0),    color:0x6c63ff, pos:[-22, 32,-18], rot:[.002,.006,.003] },
    ];
    defs.forEach(d => {
      const mat = new THREE.MeshBasicMaterial({
        color: d.color, wireframe: true,
        transparent: true, opacity: 0.1,
      });
      const mesh = new THREE.Mesh(d.geo, mat);
      mesh.position.set(...d.pos);
      mesh._rot = d.rot;
      scene.add(mesh);
      shapes.push(mesh);
    });
  }

  function buildHeroOrb() {
    const geo = new THREE.IcosahedronGeometry(9, 3);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x6c63ff, wireframe: true,
      transparent: true, opacity: 0.18,
    });
    heroMesh = new THREE.Mesh(geo, mat);
    heroMesh.position.set(28, 0, -5);
    scene.add(heroMesh);
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    particles.rotation.y = t * 0.04;
    particles.rotation.x = t * 0.015;

    // Subtle camera parallax
    camera.position.x += (mouse.x * 10 - camera.position.x) * 0.025;
    camera.position.y += (-mouse.y * 6  - camera.position.y) * 0.025;

    // Rotate shapes
    shapes.forEach(s => {
      s.rotation.x += s._rot[0];
      s.rotation.y += s._rot[1];
      s.rotation.z += s._rot[2];
    });

    // Hero orb morphing
    if (heroMesh) {
      heroMesh.rotation.y = t * 0.3;
      heroMesh.rotation.x = t * 0.18;
      heroMesh.scale.setScalar(1 + 0.04 * Math.sin(t * 0.8));
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }

  return { init };
})();
