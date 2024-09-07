import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import Lenis from "lenis";

const lenis = new Lenis();

let scrollY = 0;
let scrollProgress = 0;

lenis.on("scroll", (e) => {
  scrollY = e.actualScroll;
  scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight);

  // Update model position and rotation based on scroll
  if (model) {
    // Adjust these values to control the range of movement
    const maxRotation = Math.PI * 2; // Full rotation
    const maxYPosition = 2; // Maximum vertical movement

    gsap.to(model.rotation, {
      y: scrollProgress * maxRotation,
      duration: 0.5,
      ease: "power2.out",
    });

    gsap.to(model.position, {
      y: 2 + Math.sin(scrollProgress * Math.PI) * maxYPosition,
      duration: 0.5,
      ease: "power2.out",
    });
  }
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const loader = document.getElementById("loader");

let currentIndex = 1;
let totalSlides = 7;

const updateActiveSlide = () => {
  document.querySelectorAll(".slide-titles .title").forEach((el, index) => {
    if (index === currentIndex) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
};

const handleSlider = () => {
  if (currentIndex < totalSlides) {
    currentIndex++;
  } else {
    currentIndex = 1;
  }
  gsap.to(".slide-titles", {
    onStart: () => {
      setTimeout(() => {
        updateActiveSlide();
      }, 100);
      updateImages(currentIndex + 1);
    },
    x: `-${(currentIndex - 1) * 11.1111}%`,
    duration: 2,
    ease: "power4.out",
    // onComplete: () => {
    //   // Check if we need to reset the position for a seamless loop
    //   if (currentIndex === totalSlides) {
    //     gsap.set(".slide-titles", { x: 0 });
    //     currentIndex = 1;
    //   }
    // },
  });
};

const updateImages = (imgNumber) => {
  const imgSrc = `img${imgNumber}.jpg`;
  const imgTop = document.createElement("img");
  const imgBottom = document.createElement("img");
  imgTop.src = imgSrc;
  imgBottom.src = imgSrc;
  imgTop.style.clipPath = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
  imgBottom.style.clipPath = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
  imgTop.style.transform = "scale(2)";
  imgBottom.style.transform = "scale(2)";

  document.querySelector(".img-top").appendChild(imgTop);
  document.querySelector(".img-bottom").appendChild(imgBottom);

  gsap.to([imgTop, imgBottom], {
    clipPath: "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)",
    transform: "scale(1)",
    duration: 2,
    ease: "power4.out",
    stagger: 0.15,
    onComplete: () => {
      trimExcessImages();
    },
  });
};

const trimExcessImages = () => {
  const selectors = [".img-top", ".img-bottom"];

  selectors.forEach((selector) => {
    const container = document.querySelector(selector);
    const images = Array.from(container.querySelectorAll("img"));
    const excessCount = images.length - 5;
    if (excessCount > 0) {
      images.slice(0, excessCount).forEach((img) => {
        container.removeChild(img);
      });
    }
  });
};

let sliderInterval = setInterval(handleSlider, 5000);

document.addEventListener("click", () => {
  clearInterval(sliderInterval); // Clear the existing interval
  handleSlider(); // Call the slider handler immediately
  sliderInterval = setInterval(handleSlider, 5000); // Set a new interval
});

document.addEventListener("DOMContentLoaded", () => {
  updateImages(2);
  updateActiveSlide();
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 2;
camera.position.z = 5;

const gltfLoader = new GLTFLoader();

let model;

gltfLoader.load(
  "bose.glb",
  (gltf) => {
    model = gltf.scene;
    const loaderTl = gsap.timeline();
    loaderTl
      .to(loader, {
        opacity: 0,
        ease: "power4.easeInOut",
      })
      .to(loader, {
        display: "none",
      })
      .fromTo(
        gltf.scene.position,
        {
          y: -5,
        },
        {
          y: 2,
          ease: "expo.out",
          duration: 1,
        },
        "<"
      );
    gltf.scene.scale.set(0.9, 0.9, 0.9);
    scene.add(gltf.scene);

    // Adjust model scale based on screen width
    const baseScale = 0.9;
    const mobileBreakpoint = 768; // Adjust this value as needed
    const mobileScaleFactor = 0.7; // Adjust this value to make the model smaller on mobile

    function updateModelScale() {
      const isMobile = window.innerWidth <= mobileBreakpoint;
      const scale = isMobile ? baseScale * mobileScaleFactor : baseScale;
      gltf.scene.scale.set(scale, scale, scale);

      // Adjust vertical position for mobile
      const mobileYOffset = 1.5; // Adjust this value to move the model down
      gltf.scene.position.y = isMobile ? mobileYOffset : 2;
    }

    updateModelScale();
    window.addEventListener("resize", updateModelScale);

    const customizableParts = new Map();
    const partSelector = document.getElementById("partSelector");
    const colorSwatches = document.getElementById("colorSwatches");

    // Define color swatches
    const colors = {
      cyan: 0x5aaba5,
      burgundy: 0x342c34,
      gray: 0x7d818d,
      black: 0x1c1c1c,
      purple: 0xb9aace,
      // Add more colors as needed
    };

    // Define available colors for each part
    const partColors = {
      Ear_piece_plastic: ["cyan", "burgundy", "gray", "black", "purple"],
      Ear_piece_rubber: ["burgundy", "gray", "black"],
      // Add more parts and their available colors as needed
    };

    let isFirstOptionSelected = true;

    // Traverse the scene to find customizable parts
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.name.startsWith("Ear")) {
        customizableParts.set(child.name, child);

        // Add option to part selector
        const option = document.createElement("option");
        option.value = child.name;
        option.textContent = child.name;

        if (isFirstOptionSelected) {
          option.selected = true;
          isFirstOptionSelected = false;
        }

        partSelector.appendChild(option);
      }
    });

    // Function to update color swatches
    function updateColorSwatches(partName) {
      colorSwatches.innerHTML = ""; // Clear existing swatches
      const availableColors = partColors[partName] || [];

      availableColors.forEach((colorName) => {
        const hex = colors[colorName];
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = `#${hex.toString(16).padStart(6, "0")}`;
        swatch.addEventListener("click", () => changePartColor(partName, hex));
        colorSwatches.appendChild(swatch);
      });
    }

    // Add event listener to part selector
    partSelector.addEventListener("change", (event) => {
      updateColorSwatches(event.target.value);
    });

    // Initialize color swatches with the first part
    // updateColorSwatches(partSelector.value);

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
          duration: 1,
          ease: "power4.easeInOut",
        });
      }
    }

    // Start the animation loop after the model has been loaded
    animate();
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

const numSquares = 200;

const squares = [];

function getSquare() {
  const x = Math.round(Math.random() * 30) - 15.5;
  const y = Math.round(Math.random()) * 6 - 1;
  const z = Math.round(Math.random() * -40) - 0.5;
  const squareGeo = new THREE.PlaneGeometry(
    Math.round(Math.random() * 0.5) + 0.5,
    Math.round(Math.random() * 0.5) + 1
  );
  const color = 0x111111;
  const squareMaterial = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });
  const squareMesh = new THREE.Mesh(squareGeo, squareMaterial);
  squareMesh.position.set(x, y, z);
  squareMesh.rotation.x = -Math.PI * 0.5;
  const limit = 40;
  function update() {
    squareMesh.position.z += 0.02;
    if (squareMesh.position.z > 4) {
      squareMesh.position.z = -limit;
    }
  }

  return { squareMesh, update };
}

for (let i = 0; i < numSquares; i++) {
  const square = getSquare();
  scene.add(square.squareMesh);
  squares.push(square);
}

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
let targetZ = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Add mouse move event listener
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

  // Update directional lights position with easing
  gsap.to(directionalLight1.position, {
    x: (mouseX / windowHalfX) * 2.5,
    y: (-mouseY / windowHalfY) * 2.5,
    duration: 0.5,
    ease: "power2.out",
  });

  gsap.to(directionalLight2.position, {
    x: (-mouseX / windowHalfX) * 2.5,
    y: (mouseY / windowHalfY) * 2.5,
    duration: 0.5,
    ease: "power2.out",
  });
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

  squares.forEach((square) => {
    square.update();
  });

  // Only update model position if it exists
  if (model) {
    // Smooth camera movement
    targetX = mouseX * 0.0005;
    targetY = mouseY * 0.0005;
    targetZ = mouseY * 0.0005;

    model.position.x += (targetX - model.position.x) * 0.05;
    // model.position.y += (targetY - model.position.y) * 0.05;
    model.position.z += (targetZ - model.position.z) * 0.05;
  }

  // Update directional lights to always point at the center of the scene
  directionalLight1.lookAt(scene.position);
  directionalLight2.lookAt(scene.position);

  renderer.render(scene, camera);
}
