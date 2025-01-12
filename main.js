import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  lerp: 0.1,
  duration: 1,
});

lenis.stop();

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

const stickyHeader = document.querySelector(".sticky-header");

ScrollTrigger.create({
  trigger: ".sticky",
  start: "top top",
  end: "bottom center",
  pin: true,
  pinSpacing: true,
  onUpdate: (self) => {
    const progress = self.progress;
    const maxTranslate = stickyHeader.offsetWidth - window.innerWidth;
    const translateX = -progress * maxTranslate;

    gsap.set(stickyHeader, { x: translateX });
  },
});

ScrollTrigger.create({
  trigger: ".banner",
  start: "top top",
  end: "bottom center",
  scrub: true,
  onEnter: () => {
    flickerAnimation(".banner p span", 1);
  },
});

gsap.set(".banner", {
  clipPath: "polygon(14% 0%, 72% 0%, 88% 90%, 0% 95%)",
  // yPercent: -10,
});

gsap.from(".banner", {
  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  // yPercent: 0,
  ease: "power1.inOut",
  scrollTrigger: {
    trigger: ".banner",
    start: "top top",
    end: "bottom center",
    scrub: 1,
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
    const stage1Threshold = 1.5;
    const stage2Threshold = 3.5;

    // Rotation animation
    gsap.to(model.rotation, {
      y:
        scrollProgress <= stage1Threshold
          ? scrollProgress * maxRotation
          : scrollProgress <= stage2Threshold
          ? maxRotation * 1.1 + scrollProgress * 0.25
          : maxRotation + ((scrollProgress + stage2Threshold) * Math.PI) / 4,
      x: scrollProgress <= stage1Threshold ? 0 : -0.5,
      duration: 2,
      ease: "power2.out",
    });

    // Position animation
    gsap.to(model.position, {
      y:
        scrollProgress <= stage1Threshold
          ? 2 + Math.sin((scrollProgress / 1.5) * Math.PI)
          : scrollProgress <= stage2Threshold
          ? model.position.y
          : 2,
      x:
        scrollProgress <= stage1Threshold
          ? 0
          : scrollProgress <= stage2Threshold
          ? (scrollProgress * maxYPosition) / 4
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

    // if (scrollProgress > 3.5) {
    //   gsap.to(".video-wrap", {
    //     height: `${(scrollProgress - stage2Threshold) * 40}%`,
    //   });
    // }
  }

  // ... rest of the code ...
});

// gsap.to(".details-content", {
//   display: "block",
//   rotateY: 0,
//   scale: 1,
//   duration: 1,
//   scrollTrigger: {
//     trigger: ".details",
//     start: "top center",
//     end: "bottom bottom",
//     scrub: true,
//     toggleActions: "play reserve play reverse",
//   },
// });

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
  sliderInterval = setInterval(handleSlider, 5000);
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

const loadingCounter = loader.querySelector(".loading-counter");

const loadingManager = new THREE.LoadingManager(
  // onLoad callback
  () => {
    // Hide loader when all assets are loaded
    const loaderTl = gsap.timeline({
      onComplete: () => {
        lenis.start();
      },
    });
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
          ease: "power4.easeOut",
          duration: 1,
        },
        "<+0.2"
      );
  },

  // onProgress callback
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progress = Math.floor((itemsLoaded / itemsTotal) * 100);
    loadingCounter.textContent = `${progress}`;
  },

  // onError callback
  (url) => {
    console.error(`Error loading ${url}`);
  }
);

const gltfLoader = new GLTFLoader(loadingManager);

let model;

gltfLoader.load(
  "bose.glb",
  (gltf) => {
    model = gltf.scene;

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
      if (child.isMesh && child.name.includes("Ear")) {
        customizableParts.set(child.name, child);

        // Create a radio button for each part
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "part"; // Grouping radio buttons
        radio.value = child.name;

        if (isFirstOptionSelected) {
          radio.checked = true; // Select the first option by default
          isFirstOptionSelected = false;
          // updateColorSwatches(radio.value);
        }

        label.appendChild(radio);
        label.appendChild(
          document.createTextNode(child.name.replace("Ear_piece_", "").trim())
        );
        partSelector.appendChild(label);
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
    // updateColorSwatches(partSelector.querySelector("input").value);

    // Create color swatches
    Object.entries(colors).forEach(([name, hex]) => {
      const swatch = document.createElement("div");
      swatch.className = "color-swatch";
      swatch.style.backgroundColor = `#${hex.toString(16).padStart(6, "0")}`;
      swatch.addEventListener("click", () => {
        partSelector.querySelectorAll("input").forEach((input) => {
          if (input.checked === true) {
            changePartColor(input.value, hex);
          }
        });
      });
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
    // const percentComplete =
    //   progress.total > 0
    //     ? Math.round((progress.loaded / progress.total) * 100)
    //     : 0; // Prevent division by zero
    // loader.innerHTML = `Loading ${percentComplete}%`;
  },
  (error) => {
    console.error("An error occurred while loading the model:", error);
    loader.innerHTML = "Error loading model";
  }
);

const points = [
  {
    position: new THREE.Vector3(-2, 0.5, 0.3),
    element: document.querySelector(".point-0"),
  },
  {
    position: new THREE.Vector3(-2, -1.5, -0.5),
    element: document.querySelector(".point-1"),
  },
  // {
  //   position: new THREE.Vector3(2, 0, 0.5),
  //   element: document.querySelector(".point-2"),
  // },
];

points.forEach((point) => {
  ScrollTrigger.create({
    trigger: ".sticky",
    start: "10% bottom",
    end: "top center",
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

// Helper function for linear interpolation (lerp)
const lerp = (start, end, factor) => start + (end - start) * factor;

// Parallax effect function
function initParallax(images, factor = 0.2) {
  const imageBounds = new Map();
  const currentTranslateY = new Map();
  const targetTranslateY = new Map();

  // Function to update bounds of all images
  function updateBounds() {
    images.forEach((image) => {
      const rect = image.getBoundingClientRect();
      imageBounds.set(image, {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
      });
    });
  }

  // Function to animate the parallax effect
  function animate() {
    images.forEach((image) => {
      if (!imageBounds.has(image)) return;

      const currentY = currentTranslateY.get(image) || 0;
      const targetY = targetTranslateY.get(image) || 0;

      const newTranslateY = lerp(currentY, targetY, 0.1);
      currentTranslateY.set(image, newTranslateY);

      if (Math.abs(newTranslateY - targetY) > 0.01) {
        image.style.transform = `translateY(${newTranslateY}px) scale(1.25)`;
      }
    });

    requestAnimationFrame(animate);
  }

  // Function to handle scroll and update target translate value for each image
  function handleScroll() {
    images.forEach((image) => {
      if (!imageBounds.has(image)) return;

      const bounds = imageBounds.get(image);
      const relativeScroll = window.scrollY - bounds.top;
      targetTranslateY.set(image, relativeScroll * factor);
    });
  }

  // Initialize bounds and start animation on page load
  updateBounds();
  animate();

  // Recalculate bounds on resize and update target position on scroll
  window.addEventListener("resize", updateBounds);
  window.addEventListener("scroll", handleScroll);
}

const images = document.querySelectorAll(".banner-img");
initParallax(images);

function animate() {
  requestAnimationFrame(animate);

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
