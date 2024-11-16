import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  lerp: 0.1,
  duration: 1.5,
});

let scrollY = 0;
let scrollProgress = 0;

const introParagraphs = document.querySelectorAll(".banner p");

// Function to split text into spans
function splitTextToSpans(text) {
  return text
    .split(/(\s+)/)
    .map((part) => {
      if (part.trim() === "") {
        return part;
      } else {
        return `<span style="display: inline-block; white-space: nowrap;">${part
          .split("")
          .map(
            (char) =>
              `<span style="opacity: 0; display: inline-block;">${char}</span>`
          )
          .join("")}</span>`;
      }
    })
    .join("");
}

// Usage of the function for introParagraphs
introParagraphs.forEach((paragraph) => {
  const text = paragraph.textContent;
  paragraph.innerHTML = splitTextToSpans(text);
});

function flickerAnimation(targets, toOpacity) {
  gsap.to(targets, {
    opacity: toOpacity,
    duration: 0.2,
    stagger: {
      amount: 0.5,
      from: "random",
    },
  });
}

ScrollTrigger.create({
  trigger: ".banner",
  start: "top top",
  end: () => "bottom center",
  onEnter: () => {
    flickerAnimation(".banner p span", 1);
  },
});

lenis.on("scroll", (e) => {
  scrollY = e.actualScroll;
  scrollProgress =
    scrollY /
    (document.querySelector(".hero-wrap").clientHeight - window.innerHeight);
  // console.log(scrollProgress);

  // Update model position and rotation based on scroll
  if (model) {
    const maxRotation = Math.PI * 2; // Full rotation
    const maxYPosition = 2; // Maximum vertical movement

    // Define thresholds for different stages of animation
    const stage1Threshold = 1.1;
    const stage2Threshold = 3;

    // Rotation animation
    gsap.to(model.rotation, {
      y:
        scrollProgress <= stage1Threshold
          ? scrollProgress * maxRotation
          : scrollProgress <= stage2Threshold
          ? maxRotation * 1.2
          : maxRotation + ((scrollProgress + stage2Threshold) * Math.PI) / 3,
      x: scrollProgress <= stage1Threshold ? 0 : -0.5,
      duration: 2,
      ease: "power2.out",
    });

    // Position animation
    gsap.to(model.position, {
      y:
        scrollProgress <= stage1Threshold
          ? 2 + Math.sin(scrollProgress * Math.PI)
          : scrollProgress <= stage2Threshold
          ? model.position.y
          : 2,
      x:
        scrollProgress <= stage1Threshold
          ? 0.001
          : scrollProgress <= stage2Threshold
          ? (scrollProgress * maxYPosition) / 1.5
          : scrollProgress * 5,
      z:
        scrollProgress <= stage1Threshold
          ? 0.001
          : scrollProgress <= stage2Threshold
          ? 0.25
          : -1,
      duration: 1,
      ease: "power2.out",
    });

    if (scrollProgress > 3.5) {
      gsap.to(".video-wrap", {
        height: `${(scrollProgress - stage2Threshold) * 40}%`,
      });
    }
  }

  // ... rest of the code ...
});

gsap.to(".details-content", {
  display: "block",
  rotateY: 0,
  scale: 1,
  duration: 1,
  scrollTrigger: {
    trigger: ".details",
    start: "top center",
    end: "bottom 30%",
    scrub: true,
    toggleActions: "play reserve play reverse",
  },
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
  const imgSrc = `img${imgNumber}.jpeg`;
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
        model.position,
        {
          y: -5,
        },
        {
          y: 2,
          ease: "expo.out",
          duration: 1,
        },
        "<"
      )
      .fromTo(
        model.rotation,
        {
          y: -Math.PI,
        },
        {
          y: 0,
          ease: "expo.out",
          duration: 3,
        },
        "<+0.2"
      );
    model.scale.set(0.9, 0.9, 0.9);

    scene.add(model);

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

    function createTextureFromImage(imageUrl) {
      return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(
          imageUrl,
          (texture) => resolve(texture),
          undefined,
          (error) => reject(error)
        );
      });
    }

    async function applyDefaultTexture(partName, textureUrl) {
      const part = customizableParts.get(partName);
      if (part) {
        try {
          const texture = await createTextureFromImage(textureUrl);

          // Set texture wrapping to clamp to edge (no repeat)
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;

          // Compute the bounding box of the geometry
          part.geometry.computeBoundingBox();
          const box = part.geometry.boundingBox;
          const geometryWidth = box.max.x - box.min.x;
          const geometryHeight = box.max.y - box.min.y;

          // Calculate aspect ratios
          const textureAspect = texture.image.width / texture.image.height;
          const geometryAspect = geometryWidth / geometryHeight;

          // Set scale and offset to center the texture without repeating
          if (textureAspect > geometryAspect) {
            const scale = geometryAspect / textureAspect;
            texture.repeat.set(scale, scale);
            texture.offset.set((1 - scale) / 2, scale - 0.75);
          } else {
            const scale = textureAspect / geometryAspect;
            texture.repeat.set(scale, scale);
            texture.offset.set(0, scale);
          }

          const newMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: part.material.metalness,
            roughness: part.material.roughness,
          });
          part.material = newMaterial;
        } catch (error) {
          console.error("Error loading default texture:", error);
        }
      }
    }

    const defaultTexturePart = "Ear_piece_plastic";
    const defaultTextureUrl = "./bose.png";
    // applyDefaultTexture(defaultTexturePart, defaultTextureUrl);

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

//Points of interest
const raycaster = new THREE.Raycaster();

const points = [
  {
    position: new THREE.Vector3(-2, 0.5, 0.3),
    element: document.querySelector(".point-0"),
  },
  {
    position: new THREE.Vector3(-2, -1.5, -0.5),
    element: document.querySelector(".point-1"),
  },
];

points.forEach((point) => {
  ScrollTrigger.create({
    trigger: ".details", // Use the point's element as the trigger
    start: "10% bottom", // When the top of the point's element hits the center of the viewport
    end: "bottom center", // When the bottom of the point's element hits the center of the viewport
    onEnter: () => {
      point.element.classList.add("visible"); // Add class to make it visible
    },
    onLeave: () => {
      point.element.classList.remove("visible"); // Remove class to hide it
    },
    onEnterBack: () => {
      point.element.classList.add("visible"); // Add class to make it visible when scrolling back
    },
    onLeaveBack: () => {
      point.element.classList.remove("visible"); // Remove class to hide it when scrolling back
    },
  });
});

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
  const squareMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.2,
    roughness: 0.8,
    color,
    side: THREE.DoubleSide,
  });
  const squareMesh = new THREE.Mesh(squareGeo, squareMaterial);
  squareMesh.position.set(x, y, z);
  squareMesh.rotation.x = -Math.PI * 0.5;
  const limit = 40;
  function update() {
    squareMesh.position.z += 0.02 * (1 + scrollProgress);
    if (squareMesh.position.z > 4) {
      squareMesh.position.z = -limit;
    }
  }

  return { squareMesh, update };
}

for (let i = 0; i < numSquares; i++) {
  const square = getSquare();
  // scene.add(square.squareMesh);
  // squares.push(square);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 2.5;
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

    if (scrollProgress <= 1) {
      model.position.x += (targetX - model.position.x) * 0.05;
      // model.position.y += (targetY - model.position.y) * 0.05;
      // model.position.z += (targetZ - model.position.z) * 0.05;
    }
  }

  // Update directional lights to always point at the center of the scene
  directionalLight1.lookAt(scene.position);
  directionalLight2.lookAt(scene.position);

  for (const point of points) {
    // Get the model's world position
    const modelWorldPosition = new THREE.Vector3();
    model.getWorldPosition(modelWorldPosition);

    // Get the model's rotation
    const modelRotation = model.rotation.clone();

    // Create a direction vector based on the model's rotation
    const direction = new THREE.Vector3(
      point.position.x,
      point.position.y,
      point.position.z
    ); // Use all three coordinates from the point
    direction.applyEuler(modelRotation); // Apply the model's rotation

    // Set the point's position based on the model's world position and the transformed point's position
    const pointPosition = modelWorldPosition.clone().add(direction); // Combine model position with transformed point position

    // Project the point's position to screen space
    const screenPosition = pointPosition.clone();
    screenPosition.project(camera);

    // raycaster.setFromCamera(screenPosition, camera);
    // const intersects = raycaster.intersectObjects(scene.children, true);

    // if (intersects.length === 0) {
    //   point.element.classList.add("visible");
    // } else {
    //   const intersectionDistance = intersects[0].distance;
    //   const pointDistance = point.position.distanceTo(camera.position);

    //   if (intersectionDistance < pointDistance) {
    //     point.element.classList.remove("visible");
    //   } else {
    //     point.element.classList.add("visible");
    //   }
    // }

    const translateX = screenPosition.x * window.innerWidth * 0.5;
    const translateY = -screenPosition.y * window.innerHeight * 0.5;
    point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
  }

  renderer.render(scene, camera);
}

// Add this after the model loading section
const customizer = document.querySelector(".customizer");
const spacerSection = document.querySelector(".spacer");
gsap.set(customizer, { display: "none", opacity: 0 });

ScrollTrigger.create({
  trigger: spacerSection,
  start: "top center",
  end: "bottom, -10% bottom",
  // markers: true,
  scrub: true,
  onEnter: () =>
    gsap.to(customizer, { display: "flex", opacity: 1, duration: 0.5 }),
  onLeave: () =>
    gsap.to(customizer, { display: "none", opacity: 0, duration: 0.5 }),
  onEnterBack: () =>
    gsap.to(customizer, { display: "flex", opacity: 1, duration: 0.5 }),
  onLeaveBack: () =>
    gsap.to(customizer, { display: "none", opacity: 0, duration: 0.5 }),
});
