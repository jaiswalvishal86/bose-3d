import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

const loader = document.getElementById("loader");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const gltfLoader = new GLTFLoader();

gltfLoader.load(
  "bose.glb",
  (gltf) => {
    const loaderTl = gsap.timeline();
    loaderTl.to(loader, {
      opacity: 0,
      ease: "power4.easeInOut",
    });
    loaderTl.to(loader, {
      display: "none",
      ease: "power4.easeInOut",
    });
    gltf.scene.scale.set(0.9, 0.9, 0.9);
    scene.add(gltf.scene);

    // Adjust model scale based on screen width
    const baseScale = 0.9;
    const mobileBreakpoint = 768; // Adjust this value as needed
    const mobileScaleFactor = 0.7; // Adjust this value to make the model smaller on mobile

    function updateModelScale() {
      const scale =
        window.innerWidth <= mobileBreakpoint
          ? baseScale * mobileScaleFactor
          : baseScale;
      gltf.scene.scale.set(scale, scale, scale);
    }

    updateModelScale();
    window.addEventListener("resize", updateModelScale);

    const customizableParts = new Map();
    const partSelector = document.getElementById("partSelector");
    const colorSwatches = document.getElementById("colorSwatches");

    // Define color swatches
    const colors = {
      white: 0x342c34,
      green: 0x7d818d,
      blue: 0x1c1c1c,
      yellow: 0x5aaba5,
      purple: 0xb9aace,
      // Add more colors as needed
    };

    // Traverse the scene to find customizable parts
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.name) {
        customizableParts.set(child.name, child);

        // Add option to part selector
        const option = document.createElement("option");
        option.value = child.name;
        option.textContent = child.name.replace("_", " ");
        partSelector.appendChild(option);
      }
    });

    // Create color swatches
    Object.entries(colors).forEach(([name, hex]) => {
      const swatch = document.createElement("div");
      swatch.className = "color-swatch";
      swatch.style.backgroundColor = `#${hex.toString(16).padStart(6, "0")}`;
      swatch.addEventListener("click", () =>
        changePartColor(partSelector.value, hex)
      );
      colorSwatches.appendChild(swatch);
    });

    // Function to change part color
    function changePartColor(partName, color) {
      const part = customizableParts.get(partName);
      if (part) {
        const targetColor = new THREE.Color(color);

        gsap.to(part.material.color, {
          r: targetColor.r,
          g: targetColor.g,
          b: targetColor.b,
          duration: 1.5,
          ease: "power4.easeInOut",
        });
      }
    }
  },
  (progress) => {
    // Update loader with loading progress
    const percentComplete = Math.round(
      (progress.loaded / progress.total) * 100
    );
    loader.innerHTML = `Loading ${percentComplete}%`;
  },
  (error) => {
    console.error("An error occurred while loading the model:", error);
    loader.innerHTML = "Error loading model";
  }
);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight1.position.set(2, 5, 3);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight2.position.set(-2, -5, -3);
scene.add(directionalLight2);

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Add mouse move event listener
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

  // Update directional lights position
  directionalLight1.position.set(
    (mouseX / windowHalfX) * 2.5,
    (-mouseY / windowHalfY) * 2.5,
    3
  );
  directionalLight2.position.set(
    (-mouseX / windowHalfX) * 2.5,
    (mouseY / windowHalfY) * 2.5,
    -3
  );
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector(".webgl").appendChild(renderer.domElement);

let initialWidth = window.innerWidth;
let initialHeight = window.innerHeight;

window.addEventListener("resize", () => {
  // Check if it's a "real" resize event, not just a mobile scroll
  if (window.innerWidth !== initialWidth) {
    initialWidth = window.innerWidth;
    initialHeight = window.innerHeight;

    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = initialWidth / initialHeight;
    camera.updateProjectionMatrix();
  }
});

function animate() {
  requestAnimationFrame(animate);

  // Smooth camera movement
  targetX = mouseX * 0.005;
  targetY = mouseY * 0.005;
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (-targetY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  // Update directional lights to always point at the center of the scene
  directionalLight1.lookAt(scene.position);
  directionalLight2.lookAt(scene.position);

  renderer.render(scene, camera);
}

animate();
