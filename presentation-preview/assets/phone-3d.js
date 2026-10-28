import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './vendor/three/examples/jsm/environments/RoomEnvironment.js';

const canvas = document.getElementById('phoneModelCanvas');
const body = document.body;
let group = new THREE.Group();
const models = new Map();
const scene = new THREE.Scene();
const camera = new THREE.Camera();
const bodyMaterials = [];
let sourceScreen = { left: -1.51900208, right: 2.49661565, bottom: -6.05251312, top: 2.63805914, z: -0.49083275 };
let renderer, environment, pending = false;

function calibrateView(h, width, height, front, settings = null) {
  const a = h.m11, b = h.m21, c = h.m41, d = h.m12, e = h.m22, f = h.m42, g = h.m14, j = h.m24;
  const centerW = g * width / 2 + j * height / 2 + 1;
  const principalX = settings?.principalX ?? (front ? (a * width / 2 + b * height / 2 + c) / centerW : 0);
  const principalY = settings?.principalY ?? (front ? (d * width / 2 + e * height / 2 + f) / centerW : 0);
  const ax = a - principalX * g, ay = d - principalY * g, bx = b - principalX * j, by = e - principalY * j;
  const focalCandidates = [
    -(ax * bx + ay * by) / (g * j),
    -(ax * ax + ay * ay - bx * bx - by * by) / (g * g - j * j)
  ].filter(value => Number.isFinite(value) && value > 0);
  const focal = settings?.focal ?? Math.sqrt(focalCandidates.length ? focalCandidates.reduce((sum, value) => sum + value, 0) / focalCandidates.length : 1200 ** 2);
  const horizontal = new THREE.Vector3(ax / focal, ay / focal, g);
  const vertical = new THREE.Vector3(bx / focal, by / focal, j);
  const planeScale = Math.sqrt(horizontal.length() * vertical.length());
  const normal = new THREE.Vector3().crossVectors(horizontal, vertical).normalize();
  horizontal.normalize();
  vertical.addScaledVector(horizontal, -vertical.dot(horizontal)).normalize();
  const depthX = (normal.x * focal + principalX * normal.z) * planeScale;
  const depthY = (normal.y * focal + principalY * normal.z) * planeScale;
  const depthW = normal.z * planeScale;
  const translation = new THREE.Vector3((c - principalX) / focal, (f - principalY) / focal, 1).divideScalar(planeScale);
  const view = new THREE.Camera();
  view.position.set(-horizontal.dot(translation), -vertical.dot(translation), -normal.dot(translation));
  view.up.set(-horizontal.y, -vertical.y, -normal.y);
  view.lookAt(view.position.clone().add(new THREE.Vector3(horizontal.z, vertical.z, normal.z)));
  return { depth: new THREE.Vector3(depthX, depthY, depthW), position: view.position.clone(), rotation: view.quaternion.clone() };
}

function draw() {
  pending = false;
  if (!renderer || body.dataset.phoneModelState !== 'ready' || !body.classList.contains('present')) return;
  const modelId = body.classList.contains('androidDevice') ? 'pixel' : 'iphone';
  const active = models.get(modelId);
  body.classList.toggle('phoneModelReady', Boolean(active));
  for (const [id, model] of models) model.group.visible = id === modelId;
  if (!active) { renderer.clear(); return; }
  group = active.group; sourceScreen = active.screen;
  canvas.dataset.model = modelId;
  canvas.dataset.meshCount = String(group.children.length);
  const credit = document.querySelector('.modelCredit');
  credit.href = modelId === 'pixel' ? 'https://deviceguides.ee.co.uk/google/pixel-10-pro-android-16/3d-model-iframe/?116' : 'https://sketchfab.com/3d-models/iphone-18-pro-max-high-quality-3d-model-5e40716caa274a789de5b17798ee2e78';
  credit.textContent = modelId === 'pixel' ? '3D-модель: Pixel 10 Pro · EE / SP Selfservice' : '3D-модель: Pro Animator · CC BY 4.0';
  const width = Number(document.getElementById('width').value) || 393;
  const height = Number(document.getElementById('height').value) || 852;
  const sx = width / (sourceScreen.right - sourceScreen.left);
  const sy = height / (sourceScreen.top - sourceScreen.bottom);
  group.matrix.set(-sx, 0, 0, sourceScreen.right * sx, 0, -sy, 0, sourceScreen.top * sy, 0, 0, sx, -sourceScreen.z * sx, 0, 0, 0, 1);
  group.matrixAutoUpdate = false;
  group.matrixWorldNeedsUpdate = true;

  // Recover the camera-space screen basis from the shared homography.
  // Its cross product determines the back direction, including the vertical sign.
  const h = new DOMMatrix(document.getElementById('phone').style.transform);
  const a = h.m11, b = h.m21, c = h.m41, d = h.m12, e = h.m22, f = h.m42, g = h.m14, j = h.m24;
  const matrices = JSON.parse(canvas.dataset.poseProjections);
  const weights = JSON.parse(canvas.dataset.poseWeights);
  const cameras = JSON.parse(canvas.dataset.poseCameras);
  const views = matrices.map((matrix, index) => calibrateView(new DOMMatrix(matrix), width, height, index === 1, cameras[index]));
  const depth = new THREE.Vector3();
  views.forEach((view, index) => depth.addScaledVector(view.depth, weights[index]));
  const depthX = depth.x, depthY = depth.y, depthW = depth.z;
  const clip = new THREE.Matrix4().set(
    2 * a / 1200 - g, 2 * b / 1200 - j, 2 * depthX / 1200 - depthW, 2 * c / 1200 - 1,
    g - 2 * d / 900, j - 2 * e / 900, depthW - 2 * depthY / 900, 1 - 2 * f / 900,
    0, 0, 0.001, 0,
    g, j, depthW, 1
  );
  camera.position.set(0, 0, 0);
  let orientationWeight = 0;
  views.forEach((view, index) => {
    const weight = weights[index];
    camera.position.addScaledVector(view.position, weight);
    if (weight < 1e-9) return;
    if (orientationWeight < 1e-9) camera.quaternion.copy(view.rotation);
    else camera.quaternion.slerp(view.rotation, weight / (orientationWeight + weight));
    orientationWeight += weight;
  });
  camera.updateMatrixWorld(true);
  camera.projectionMatrix.multiplyMatrices(clip, camera.matrixWorld);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

  const gray = document.getElementById('finish').value !== '#242426';
  for (const material of bodyMaterials) {
    material.color.set(gray ? '#6d7279' : '#25282e');
    material.metalness = 0.82;
    material.roughness = gray ? 0.34 : 0.3;
  }
  renderer.render(scene, camera);
  canvas.dataset.finish = gray ? 'gray' : 'graphite';
  canvas.dataset.bodyMaterialCount = String(bodyMaterials.length);
  canvas.dataset.depthDirection = JSON.stringify([depthX, depthY, depthW]);
}

function scheduleDraw() {
  if (body.classList.contains('poseTransition')) { draw(); return; }
  if (!pending) { pending = true; requestAnimationFrame(draw); }
}

async function initialize() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(1200, 900, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.65;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x38404b, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(-600, -800, -1200);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd9e5ff, 1.1);
    rim.position.set(1000, 100, -500);
    scene.add(rim);

    const gltf = await new GLTFLoader().loadAsync(new URL('./models/iphone-18-pro-max.glb', import.meta.url).href);
    gltf.scene.traverse(node => {
      if (!node.isMesh) return;
      const original = node.material;
      // Discard the author's studio ground and baked display, retain actual hardware.
      if (original.name === 'Material.003' || original.name === 'Material.001') return;
      const material = original.clone();
      if (/17ProMax_color/.test(material.name)) bodyMaterials.push(material);
      if (material.name === '17ProMax_Logo') material.color.set('#17191c');
      material.side = THREE.DoubleSide;
      const mesh = new THREE.Mesh(node.geometry, material);
      mesh.frustumCulled = false;
      group.add(mesh);
    });
    scene.add(group);
    models.set('iphone', { group, screen: sourceScreen });
    try {
      const pixel = await new GLTFLoader().loadAsync(new URL('./models/pixel-10-pro.glb', import.meta.url).href);
      pixel.scene.updateMatrixWorld(true);
      const pixelGroup = new THREE.Group();
      const screenBounds = new THREE.Box3();
      const canonical = new THREE.Matrix4().makeScale(-1, 1, -1);
      pixel.scene.traverse(node => {
        if (!node.isMesh) return;
        const geometry = node.geometry.clone().applyMatrix4(node.matrixWorld).applyMatrix4(canonical);
        geometry.computeBoundingBox();
        if (node.material.name === 'Screen') { screenBounds.union(geometry.boundingBox); geometry.dispose(); return; }
        // The live DOM replaces the front glass/display image; retain the camera punch-hole and bezel.
        if (node.name.includes('_Glass')) { geometry.dispose(); return; }
        const material = node.material.clone();
        if (['Body', 'Cover', 'Camera_Base'].includes(material.name)) {
          // The original base-color texture contains its factory finish; use the selected tint.
          material.map = null;
          bodyMaterials.push(material);
        }
        material.side = THREE.DoubleSide;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        pixelGroup.add(mesh);
      });
      if (screenBounds.isEmpty()) throw new Error('Pixel display geometry missing');
      const screen = { left: screenBounds.min.x, right: screenBounds.max.x, bottom: screenBounds.min.y, top: screenBounds.max.y, z: screenBounds.min.z };
      scene.add(pixelGroup);
      models.set('pixel', { group: pixelGroup, screen });
      body.dataset.pixelModelState = 'ready';
    } catch (error) { body.dataset.pixelModelState = 'error'; console.error('Unable to render Pixel GLB:', error); }

    body.dataset.phoneModelState = 'ready';
    body.classList.add('phoneModelReady');
    canvas.dataset.meshCount = String(group.children.length);
    window.fit();
    draw();
  } catch (error) {
    body.dataset.phoneModelState = 'error';
    body.classList.remove('phoneModelReady');
    console.error('Unable to render the supplied iPhone GLB:', error);
  }
}

window.addEventListener('phone-pose-change', scheduleDraw);
document.getElementById('finish').addEventListener('input', scheduleDraw);
document.getElementById('device').addEventListener('change', scheduleDraw);
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  body.classList.remove('phoneModelReady');
  body.dataset.phoneModelState = 'context-lost';
});
canvas.addEventListener('webglcontextrestored', () => {
  body.dataset.phoneModelState = 'ready';
  body.classList.add('phoneModelReady');
  scheduleDraw();
});
initialize();
