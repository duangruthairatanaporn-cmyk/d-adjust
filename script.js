const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const heroImage = document.querySelector("[data-parallax]");
const chapters = document.querySelectorAll("[data-chapter]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const onePageViewer = document.body.classList.contains("one-page-viewer");
const selectedWorks = [
  "assets/selected/selected-01.jpg",
  "assets/selected/selected-02.jpg",
  "assets/selected/selected-03.jpg",
  "assets/selected/selected-04.jpg",
  "assets/selected/selected-05.jpg",
  "assets/selected/selected-06.jpg",
  "assets/selected/selected-07.jpg",
  "assets/selected/selected-08.jpg",
  "assets/selected/selected-09.jpg",
  "assets/selected/selected-10.jpg",
  "assets/selected/selected-11.jpg",
  "assets/selected/selected-13.jpg",
  "assets/selected/selected-14.jpg",
].map((src, index) => ({
  src,
  title: `Selected Work ${String(index + 1).padStart(2, "0")}`,
}));

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 36);
}

function updateParallax() {
  if (reducedMotion.matches || !heroImage) {
    return;
  }

  const movement = Math.min(window.scrollY * 0.13, 76);
  heroImage.style.setProperty("--hero-shift", `${movement}px`);
}

function toggleMenu() {
  const open = menuButton.classList.toggle("open");
  mobileMenu.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}

function initMenu() {
  menuButton.addEventListener("click", toggleMenu);

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (menuButton.classList.contains("open")) {
        toggleMenu();
      }
    });
  });
}

function initSmoothScroll() {
  if (onePageViewer || reducedMotion.matches || typeof Lenis === "undefined") {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.35,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.86,
  });

  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  return lenis;
}

function initSplitting() {
  if (typeof Splitting === "undefined") {
    return [];
  }

  return Splitting({ target: "[data-splitting]" });
}

function initFallbackReveal() {
  const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -48px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function initSelectedViewer() {
  const viewer = document.querySelector("[data-selected-viewer]");

  if (!viewer) {
    return;
  }

  const stage = viewer.querySelector(".viewer-stage");
  const image = viewer.querySelector("[data-viewer-image]");
  const count = viewer.querySelector("[data-viewer-count]");
  const title = viewer.querySelector("[data-viewer-title]");
  const progress = viewer.querySelector("[data-viewer-progress]");
  const prev = viewer.querySelector("[data-viewer-prev]");
  const next = viewer.querySelector("[data-viewer-next]");
  let index = 0;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;
  let isDragging = false;
  let hasMoved = false;
  let hovering = false;
  let isChanging = false;
  let wheelIntent = 0;
  let wheelTimer = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function applyTransform() {
    stage.style.setProperty("--viewer-scale", scale.toFixed(3));
    stage.style.setProperty("--viewer-x", `${offsetX.toFixed(1)}px`);
    stage.style.setProperty("--viewer-y", `${offsetY.toFixed(1)}px`);
  }

  function resetTransform() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    stage.style.setProperty("--viewer-origin-x", "50%");
    stage.style.setProperty("--viewer-origin-y", "50%");
    applyTransform();
  }

  function updateMeta() {
    const current = selectedWorks[index];
    count.textContent = `${String(index + 1).padStart(2, "0")} / ${selectedWorks.length}`;
    title.textContent = current.title;
    progress.style.transform = `scaleX(${(index + 1) / selectedWorks.length})`;
  }

  function show(nextIndex, direction = 1) {
    if (isChanging) {
      return;
    }

    isChanging = true;
    stage.classList.add("is-changing");

    function swapImage() {
      index = (nextIndex + selectedWorks.length) % selectedWorks.length;
      image.src = selectedWorks[index].src;
      image.alt = `${selectedWorks[index].title} from the curated D-Adjust work set`;
      resetTransform();
      updateMeta();
      stage.classList.remove("is-changing");

      if (window.gsap) {
        gsap.fromTo(
          image,
          { xPercent: onePageViewer ? 0 : direction * 4, scale: onePageViewer ? 1.18 : 1.035, autoAlpha: 0.08 },
          {
            xPercent: 0,
            scale: 1,
            autoAlpha: 1,
            duration: onePageViewer ? 0.72 : 0.55,
            ease: "power3.out",
            onComplete: () => {
              isChanging = false;
            },
          }
        );
      } else {
        window.setTimeout(() => {
          isChanging = false;
        }, onePageViewer ? 520 : 260);
      }
    }

    if (window.gsap && onePageViewer) {
      gsap.to(image, {
        scale: 1.18,
        autoAlpha: 0,
        duration: 0.34,
        ease: "power2.in",
        onComplete: swapImage,
      });
    } else {
      window.setTimeout(swapImage, 140);
    }
  }

  function go(delta) {
    show(index + delta, delta);
  }

  function zoom(event) {
    event.preventDefault();
    const rect = stage.getBoundingClientRect();
    const originX = ((event.clientX - rect.left) / rect.width) * 100;
    const originY = ((event.clientY - rect.top) / rect.height) * 100;
    const zoomDelta = event.deltaY < 0 ? 0.12 : -0.12;
    const nextScale = clamp(scale + zoomDelta, 1, 2.65);

    stage.style.setProperty("--viewer-origin-x", `${originX}%`);
    stage.style.setProperty("--viewer-origin-y", `${originY}%`);
    scale = nextScale;

    if (scale === 1) {
      offsetX = 0;
      offsetY = 0;
    }

    applyTransform();
  }

  function wheelToProject(event) {
    event.preventDefault();

    if (isChanging) {
      return;
    }

    wheelIntent += event.deltaY;
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => {
      if (Math.abs(wheelIntent) > 18) {
        go(wheelIntent > 0 ? 1 : -1);
      }

      wheelIntent = 0;
    }, 38);
  }

  function pointerDown(event) {
    isDragging = true;
    hasMoved = false;
    startX = event.clientX;
    startY = event.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
    stage.classList.add("is-dragging");
    stage.setPointerCapture?.(event.pointerId);
  }

  function pointerMove(event) {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    hasMoved = Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8;

    if (!onePageViewer && scale > 1.01) {
      offsetX = startOffsetX + deltaX;
      offsetY = startOffsetY + deltaY;
      applyTransform();
    }
  }

  function pointerUp(event) {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    isDragging = false;
    stage.classList.remove("is-dragging");
    stage.releasePointerCapture?.(event.pointerId);

    if ((onePageViewer || scale <= 1.01) && hasMoved && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 46) {
      go(deltaX < 0 ? 1 : -1);
    }
  }

  if (onePageViewer) {
    window.addEventListener("wheel", wheelToProject, { passive: false });
  } else {
    stage.addEventListener("wheel", zoom, { passive: false });
  }
  stage.addEventListener("pointerdown", pointerDown);
  stage.addEventListener("pointermove", pointerMove);
  stage.addEventListener("pointerup", pointerUp);
  stage.addEventListener("pointercancel", pointerUp);
  stage.addEventListener("mouseenter", () => {
    hovering = true;
  });
  stage.addEventListener("mouseleave", () => {
    hovering = false;
    isDragging = false;
    stage.classList.remove("is-dragging");
  });
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  window.addEventListener("keydown", (event) => {
    if (!onePageViewer && !hovering) {
      return;
    }

    if (event.key === "ArrowRight") {
      go(1);
    }

    if (event.key === "ArrowLeft") {
      go(-1);
    }

    if (event.key === "Escape") {
      resetTransform();
    }
  });

  updateMeta();
  resetTransform();
}

function initGsapScenes() {
  if (onePageViewer) {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    return;
  }

  if (reducedMotion.matches || !window.gsap || !window.ScrollTrigger) {
    initFallbackReveal();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(".reveal:not(.is-visible)", { autoAlpha: 0, y: 64 });
  gsap.set(".project-card, .archive-card, .still, .feature-frame", {
    transformOrigin: "50% 70%",
  });

  document.querySelectorAll("[data-splitting]").forEach((heading) => {
    const chars = heading.querySelectorAll(".char");

    if (!chars.length) {
      return;
    }

    gsap.from(chars, {
      scrollTrigger: {
        trigger: heading,
        start: "top 82%",
      },
      yPercent: 110,
      rotateX: -68,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: {
        amount: 0.55,
        from: "start",
      },
    });
  });

  chapters.forEach((chapter) => {
    const reveals = chapter.querySelectorAll(".reveal:not(.is-visible)");
    const images = chapter.querySelectorAll(".project-image img, .archive-card img, .feature-frame img, .still img");

    if (reveals.length) {
      gsap.to(reveals, {
        autoAlpha: 1,
        y: 0,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: {
          trigger: chapter,
          start: "top 72%",
        },
      });
    }

    if (images.length) {
      gsap.fromTo(
        images,
        { scale: 1.08, yPercent: 5, filter: "saturate(0.82) brightness(0.82)" },
        {
          scale: 1,
          yPercent: -3,
          filter: "saturate(1) brightness(1)",
          ease: "none",
          scrollTrigger: {
            trigger: chapter,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      );
    }

    gsap.fromTo(
      chapter,
      { "--chapter-glow": 0.08 },
      {
        "--chapter-glow": 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: chapter,
          start: "top 80%",
          end: "center center",
          scrub: true,
        },
      }
    );
  });

  if (heroImage) {
    gsap.to(heroImage, {
      scale: 1.12,
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
  };
}

function initPaintCanvas() {
  const canvas = document.querySelector("[data-paint-canvas]");

  if (!canvas || reducedMotion.matches || typeof THREE === "undefined") {
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const clock = new THREE.Clock();
  const pointer = { x: 0.5, y: 0.35 };
  const color = new THREE.Color(0.16, 0.12, 0.08);
  const targetColor = color.clone();

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPointer: { value: new THREE.Vector2(pointer.x, pointer.y) },
    uColor: { value: color },
    uResolution: { value: new THREE.Vector2(1, 1) },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      varying vec2 vUv;
      uniform float uTime;
      uniform float uScroll;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      uniform vec3 uColor;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amp = 0.5;

        for (int i = 0; i < 5; i++) {
          value += amp * noise(p);
          p *= 2.02;
          amp *= 0.52;
        }

        return value;
      }

      void main() {
        vec2 uv = vUv;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = (uv - 0.5) * aspect;
        vec2 mouse = (uPointer - 0.5) * aspect;

        float cursorGlow = 1.0 - smoothstep(0.0, 0.52, distance(p, mouse));
        float slow = uTime * 0.035;
        float flow = fbm(uv * vec2(3.0, 2.1) + vec2(slow + uScroll * 0.16, -slow));
        float grain = noise(uv * uResolution * 0.55 + uTime);
        float veil = smoothstep(0.15, 0.95, flow);

        vec3 charcoal = vec3(0.015, 0.015, 0.014);
        vec3 warm = uColor + vec3(0.04, 0.022, 0.0);
        vec3 ochre = vec3(0.86, 0.48, 0.13);
        vec3 paint = mix(charcoal, warm, veil * 0.64);
        paint += ochre * cursorGlow * 0.12;
        paint += grain * 0.035;

        float vignette = smoothstep(0.96, 0.25, distance(uv, vec2(0.5)));
        gl_FragColor = vec4(paint * vignette, 0.82);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width, height);
  }

  function setTone(hex) {
    const next = hexToRgb(hex);
    targetColor.setRGB(next.r, next.g, next.b);
  }

  function animate() {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uScroll.value = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    uniforms.uPointer.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.06);
    uniforms.uColor.value.lerp(targetColor, 0.035);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = 1 - event.clientY / window.innerHeight;
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    },
    { passive: true }
  );

  chapters.forEach((chapter) => {
    if (window.gsap && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: chapter,
        start: "top center",
        end: "bottom center",
        onEnter: () => setTone(chapter.dataset.tone || "#171613"),
        onEnterBack: () => setTone(chapter.dataset.tone || "#171613"),
      });
    }
  });

  resize();
  setTone(chapters[0]?.dataset.tone || "#2c2118");
  animate();
}

function initPage() {
  initMenu();
  initSplitting();
  initSelectedViewer();
  initSmoothScroll();
  initGsapScenes();
  initPaintCanvas();
  updateHeader();
  updateParallax();
}

window.addEventListener(
  "scroll",
  () => {
    updateHeader();
    updateParallax();
  },
  { passive: true }
);

initPage();
