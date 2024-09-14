import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Canvas
const canvas = document.querySelector('canvas');

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45, // Field of View
  window.innerWidth / window.innerHeight, // Aspect Ratio
  0.1, // Near
  1000 // Far
);

// Initial camera position
const initialCameraPosition = new THREE.Vector3(0, 1.8, 0);
camera.position.copy(initialCameraPosition);

// Initial spherical parameters
let radius = initialCameraPosition.length();
let theta = 0; // Horizontal angle (yaw)
let phi = Math.PI / 12; // Vertical angle (pitch) 

// Define barriers for min and max radius
const minRadius = 1; // Minimum distance
const maxRadius = 5; // Maximum distance

// Function to update camera position based on spherical coordinates
const updateCameraPosition = () => {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  camera.position.set(x, y + 1.8, z);
  camera.lookAt(0, 1.8, 0);
};

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,  // Set this to true if you want a transparent canvas background
});
renderer.setSize(window.innerWidth, window.innerHeight);

// GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.load('/model/swedish-royal/scene.gltf', (gltf) => {
  console.log('Model loaded!', gltf);
  const model = gltf.scene;
  scene.add(model);

  // Handle mouse and touch movement
  let isMouseDown = false;
  const onMouseDownPosition = new THREE.Vector2();

  const onPointerDown = (event) => {
    isMouseDown = true;
    onMouseDownPosition.set(event.clientX || event.touches[0].clientX, event.clientY || event.touches[0].clientY);
  };

  const onPointerUp = () => {
    isMouseDown = false;
  };

  const onPointerMove = (event) => {
    if (isMouseDown) {
      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;
      const deltaX = clientX - onMouseDownPosition.x;
      const deltaY = clientY - onMouseDownPosition.y;

      // Update angles based on movement
      theta -= deltaX * 0.005; // Adjust rotation speed for yaw
      phi -= deltaY * 0.005; // Adjust rotation speed for pitch

      // Clamp pitch to avoid flipping
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, phi));

      // Update camera position based on new angles
      updateCameraPosition();

      // Update last mouse/touch position
      onMouseDownPosition.set(clientX, clientY);
    }
  };

  // Event listeners
  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('mousemove', onPointerMove);

  // Touch events
  window.addEventListener('touchstart', onPointerDown);
  window.addEventListener('touchend', onPointerUp);
  window.addEventListener('touchmove', onPointerMove);

  // Initial camera positioning
  updateCameraPosition();
});

// Resize function
const onWindowResize = () => {
  // Update camera aspect ratio and renderer size
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// Event listener for window resize
window.addEventListener('resize', onWindowResize);

// Animation loop
const animate = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate(); // Start animation loop

// Custom clamp function
Math.clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};
