// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0912);
scene.fog = new THREE.Fog(0x0d0912, 10, 40);

// Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('flowerCanvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Sun glow
const sunGeometry = new THREE.CircleGeometry(2, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfff9c4, transparent: true, opacity: 0.9 });
const sunGlow = new THREE.Mesh(sunGeometry, sunMaterial);
sunGlow.position.set(-10, 15, -20);
scene.add(sunGlow);

// Function to create flower
function createFlower(x, z, color = 0xff69b4) {
  const flowerGroup = new THREE.Group();

  // Petals
  const petalMaterial = new THREE.MeshStandardMaterial({ color });
  for (let i = 0; i < 6; i++) {
    const petalGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    const angle = (i / 6) * Math.PI * 2;
    petal.position.set(Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6);
    flowerGroup.add(petal);
  }

  const centerGeometry = new THREE.SphereGeometry(0.25, 32, 32);
  const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const center = new THREE.Mesh(centerGeometry, centerMaterial);
  flowerGroup.add(center);

  // Stem
  class SwirlCurve extends THREE.Curve {
    constructor() {
      super();
    }
    getPoint(t) {
      const angle = t * Math.PI * 2; // swirl around
      const radius = 0.2; // swirl radius
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -t * 1.5;
      return new THREE.Vector3(x, y, z);
    }
  }

  const path = new SwirlCurve();
  const stemGeometry = new THREE.TubeGeometry(path, 64, 0.05, 8, false);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b25, roughness: 0.2 });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  flowerGroup.add(stem);

  flowerGroup.position.set(x, 0.5, z);
  scene.add(flowerGroup);
  return flowerGroup;
}

// Generate random flowers
const flowers = [];
const colors = [0xff69b3, 0xffc1e4, 0x87ceeb, 0xffd703, 0xe3ffc8, 0xffa07a, 0xda70d6, 0xffb6c1, 0xadd8e6];
for (let i = 0; i < 30; i++) {
  const x = (Math.random() - 0.5) * 25; // spread across X
  const z = (Math.random() - 0.5) * 25; // spread across Z
  const color = colors[Math.floor(Math.random() * colors.length)];
  flowers.push(createFlower(x, z, color));
}

// Sparkles (particles)
const sparkleCount = 200;
const sparkleGeometry = new THREE.BufferGeometry();
const positions = [];
for (let i = 0; i < sparkleCount; i++) {
  positions.push((Math.random() - 0.5) * 50);
  positions.push(Math.random() * 15);
  positions.push((Math.random() - 0.5) * 50);
}
sparkleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const sparkleMaterial = new THREE.PointsMaterial({
  color: 0xfffeee,
  size: 0.06,
  transparent: true,
  opacity: 0.8
});
const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
scene.add(sparkles);

// Animation
let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Flower sway
  flowers.forEach((flower, index) => {
    flower.position.y = 0.5 + Math.sin(elapsed + index) * 0.2;
    flower.rotation.y += 0.005;
  });

  // Sparkles drift upward slowly
  sparkles.rotation.y += 0.0005;
  sparkles.position.y = Math.sin(elapsed * 0.2) * 0.5;

  // Camera orbit
  const radius = 15;
  camera.position.x = Math.cos(elapsed * 0.1) * radius;
  camera.position.z = Math.sin(elapsed * 0.1) * radius;
  camera.lookAt(0, 0.5, 0);

  renderer.render(scene, camera);
}
animate();

// Responsive window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});