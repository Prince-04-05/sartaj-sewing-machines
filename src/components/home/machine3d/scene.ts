// Procedural 3D model of the SARTAJ 95 T 10 industrial machine (ported from the owner's
// three.js file). Browser-only: import this module dynamically after hydration.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type MachineView = "front" | "side" | "top" | "reset";

export type MachineScene = {
  setAutoRotate: (on: boolean) => void;
  setRunning: (on: boolean) => void;
  goTo: (view: MachineView) => void;
  zoom: (direction: 1 | -1) => void;
  setActive: (on: boolean) => void;
  dispose: () => void;
};

type Options = {
  autoRotate: boolean;
  onAutoRotateChange: (on: boolean) => void;
  onReady: () => void;
};

/* Lights were tuned for three r128 (legacy light units). */
const LIGHT_SCALE = Math.PI;
const AUTO_ROTATE_SPEED = 1.1;
const RUN_SPEED = 9;
const TWEEN_SECONDS = 0.8;
const MIN_DISTANCE = 5;
const MAX_DISTANCE = 22;

export function createMachineScene(stage: HTMLElement, opts: Options): MachineScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = "block h-full w-full cursor-grab active:cursor-grabbing";
  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive 3D model of the SARTAJ 95 T 10 sewing machine",
  );
  renderer.domElement.setAttribute("role", "img");
  stage.insertBefore(renderer.domElement, stage.firstChild);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const HOME = new THREE.Vector3(5.2, 4.6, 10.2);
  const TARGET = new THREE.Vector3(0.35, 1.45, 0);
  camera.position.copy(HOME);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = MAX_DISTANCE;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  // Wheel zoom would hijack page scrolling on the homepage; zoom uses the buttons instead.
  controls.enableZoom = false;
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
  controls.update();

  /* ---------- helpers ---------- */
  function canvasTex(
    w: number,
    h: number,
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  ) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, base: string, n: number) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const light = Math.random() > 0.5;
      ctx.fillStyle = light
        ? "rgba(150,175,215," + (0.05 + Math.random() * 0.12) + ")"
        : "rgba(0,0,0," + (0.1 + Math.random() * 0.2) + ")";
      const s = 1 + Math.random() * 2.4;
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  }
  const LETTERS = ["#e23a2c", "#1fa84f", "#2b6bdc", "#e23a2c", "#1fa84f", "#f2b824"];
  function drawWord(
    ctx: CanvasRenderingContext2D,
    word: string,
    cx: number,
    cy: number,
    size: number,
    stroke?: string,
  ) {
    ctx.font = "900 " + size + 'px Georgia, "Times New Roman", serif';
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const letters = word.split("");
    const gap = size * 0.06;
    const widths: number[] = [];
    let total = 0;
    let i: number;
    for (i = 0; i < word.length; i++) {
      const wd = ctx.measureText(letters[i]!).width;
      widths[i] = wd;
      total += wd + gap;
    }
    total -= gap;
    let x = cx - total / 2;
    for (i = 0; i < word.length; i++) {
      ctx.lineJoin = "round";
      ctx.lineWidth = size * 0.16;
      ctx.strokeStyle = stroke || "#e8b73a";
      ctx.strokeText(letters[i]!, x, cy);
      ctx.fillStyle = LETTERS[i % LETTERS.length]!;
      ctx.fillText(letters[i]!, x, cy);
      x += widths[i]! + gap;
    }
  }
  function fleur(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, dir: number) {
    ctx.fillStyle = "#e8b73a";
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.55, y);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s * 0.55, y);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + dir * s * 1.0, y, s * 0.28, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#1fa84f";
    ctx.beginPath();
    ctx.arc(x, y, s * 0.2, 0, 7);
    ctx.fill();
  }
  function shadowed<T extends THREE.Mesh>(m: T): T {
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* ---------- environment (soft studio reflections) ---------- */
  (function () {
    const env = new THREE.Scene();
    const gradTex = canvasTex(8, 256, function (ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#9db5dc");
      g.addColorStop(0.5, "#33466b");
      g.addColorStop(1, "#0b1428");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(30, 32, 16),
      new THREE.MeshBasicMaterial({ map: gradTex, side: THREE.BackSide }),
    );
    env.add(dome);
    function box(x: number, y: number, z: number, w: number, h: number, rotY?: number) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
      );
      m.position.set(x, y, z);
      m.rotation.y = rotY || 0;
      env.add(m);
    }
    box(-12, 10, 8, 14, 5, 0.7);
    box(14, 6, 4, 6, 8, -1.2);
    box(0, 18, -4, 16, 8, 0);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env).texture;
    pm.dispose();
  })();

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xaec4ea, 0x0b1224, 0.35 * LIGHT_SCALE));
  const sun = new THREE.DirectionalLight(0xfff1d6, 1.35 * LIGHT_SCALE);
  sun.position.set(5, 9, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x7ea6ff, 0.55 * LIGHT_SCALE);
  rim.position.set(-7, 4, -6);
  scene.add(rim);

  /* ---------- materials ---------- */
  const M = {
    body: new THREE.MeshStandardMaterial({ color: 0x252a33, metalness: 0.55, roughness: 0.36 }),
    under: new THREE.MeshStandardMaterial({ color: 0x131720, metalness: 0.4, roughness: 0.6 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xdfe4ec, metalness: 1, roughness: 0.14 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xb4bcc8, metalness: 0.95, roughness: 0.28 }),
    black: new THREE.MeshStandardMaterial({ color: 0x07080b, metalness: 0.5, roughness: 0.3 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf2f1ea, metalness: 0.1, roughness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe0b246, metalness: 0.9, roughness: 0.3 }),
  };

  const machine = new THREE.Group();
  scene.add(machine);

  /* ---------- bed / table top ---------- */
  const bedTop = canvasTex(1480, 640, function (ctx, w, h) {
    speckle(ctx, w, h, "#1d2b46", 9000);
    ctx.strokeStyle = "#dcab3c";
    ctx.lineWidth = 11;
    ctx.strokeRect(46, 46, w - 92, h - 92);
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 10]);
    ctx.strokeRect(72, 72, w - 144, h - 144);
    ctx.setLineDash([]);
    ctx.fillStyle = "#dcab3c";
    let i, x;
    for (i = 0; i < 24; i++) {
      x = 120 + i * ((w - 240) / 23);
      ctx.beginPath();
      ctx.arc(x, h - 59, 5, 0, 7);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, 59, 5, 0, 7);
      ctx.fill();
    }
    (
      [
        [46, 46],
        [w - 46, 46],
        [46, h - 46],
        [w - 46, h - 46],
      ] as const
    ).forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 18, 0, 7);
      ctx.fill();
      ctx.fillStyle = "#1d2b46";
      ctx.beginPath();
      ctx.arc(p[0], p[1], 8, 0, 7);
      ctx.fill();
      ctx.fillStyle = "#dcab3c";
    });
    /* centre badge */
    const cx = w * 0.47,
      cy = h * 0.74;
    ctx.fillStyle = "#e8c15a";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 150, 52, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#10182a";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 138, 42, 0, 0, 7);
    ctx.fill();
    drawWord(ctx, "SARTAJ", cx, cy, 44, "#e8b73a");
    ctx.strokeStyle = "#e8c15a";
    ctx.lineWidth = 6;
    [-1, 1].forEach(function (d) {
      ctx.beginPath();
      ctx.moveTo(cx + d * 160, cy);
      ctx.quadraticCurveTo(cx + d * 215, cy - 40, cx + d * 270, cy - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + d * 160, cy + 6);
      ctx.quadraticCurveTo(cx + d * 215, cy + 20, cx + d * 262, cy + 24);
      ctx.stroke();
    });
  });
  const sideMat = new THREE.MeshStandardMaterial({
    color: 0x0f1626,
    metalness: 0.3,
    roughness: 0.55,
  });
  const topMat = new THREE.MeshStandardMaterial({ map: bedTop, metalness: 0.25, roughness: 0.4 });
  const bed = shadowed(
    new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.2, 3.2), [
      sideMat,
      sideMat,
      topMat,
      sideMat,
      sideMat,
      sideMat,
    ]),
  );
  bed.position.set(0.3, -0.1, 0);
  machine.add(bed);
  const under = shadowed(new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.5, 2.4), M.under));
  under.position.set(0.3, -0.45, 0);
  machine.add(under);
  const plate = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.03, 0.75), M.chrome));
  plate.position.set(-2.55, 0.015, 0.05);
  machine.add(plate);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.032, 0.07), M.black);
  slot.position.set(-2.5, 0.017, 0.05);
  machine.add(slot);

  /* ---------- main housing: one C-shaped profile ---------- */
  const p = new THREE.Shape();
  p.moveTo(-3.0, 1.4);
  p.lineTo(-2.1, 1.4);
  p.lineTo(-2.1, 2.1);
  p.lineTo(1.35, 2.1);
  p.quadraticCurveTo(1.6, 2.1, 1.6, 1.85);
  p.lineTo(1.6, 0.0);
  p.lineTo(2.85, 0.0);
  p.lineTo(2.85, 2.1);
  p.lineTo(3.3, 2.1);
  p.lineTo(3.3, 3.0);
  p.quadraticCurveTo(3.3, 3.25, 3.05, 3.25);
  p.lineTo(-1.0, 3.25);
  p.lineTo(-2.4, 3.35);
  p.quadraticCurveTo(-3.0, 3.35, -3.0, 2.95);
  p.lineTo(-3.0, 1.4);
  const hg = new THREE.ExtrudeGeometry(p, {
    depth: 1.0,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 4,
    curveSegments: 14,
  });
  hg.translate(0, 0, -0.5);
  const housing = shadowed(new THREE.Mesh(hg, M.body));
  machine.add(housing);
  const FRONT = 0.575;

  /* black band + SARTAJ plate on the arm */
  const band = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 0.52),
    new THREE.MeshStandardMaterial({ color: 0x050608, metalness: 0.6, roughness: 0.22 }),
  );
  band.position.set(0.55, 2.66, FRONT);
  machine.add(band);
  const labelTex = canvasTex(1024, 256, function (ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    fleur(ctx, 70, h / 2, 34, -1);
    fleur(ctx, w - 70, h / 2, 34, 1);
    drawWord(ctx, "SARTAJ", w / 2, h / 2 + 4, 150, "#e8b73a");
  });
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 0.525),
    new THREE.MeshStandardMaterial({
      map: labelTex,
      transparent: true,
      roughness: 0.35,
      metalness: 0.3,
    }),
  );
  label.position.set(-0.55, 2.66, FRONT + 0.003);
  machine.add(label);

  /* model plate on pillar */
  const plateTex = canvasTex(512, 600, function (ctx, w, h) {
    ctx.fillStyle = "#0b0c10";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e8b73a";
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = "#f2f1ea";
    ctx.font = "800 92px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("95 T 10", w / 2, 120);
    drawWord(ctx, "SARTAJ", w / 2, 290, 96, "#e8b73a");
    ctx.fillStyle = "#e8b73a";
    ctx.font = "700 34px Arial, sans-serif";
    ctx.fillText("SEWING MACHINE", w / 2, 400);
    ctx.fillStyle = "#9aa3b4";
    ctx.font = "600 26px Arial, sans-serif";
    ctx.fillText("INDUSTRIAL QUALITY", w / 2, 460);
  });
  const mp = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 1.0),
    new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.35, metalness: 0.4 }),
  );
  mp.position.set(2.22, 1.22, FRONT);
  machine.add(mp);

  /* red + gold decal on lower pillar */
  const decalTex = canvasTex(512, 380, function (ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#b3201a");
    g.addColorStop(1, "#7d1210");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#e8b73a";
    for (let y = 30; y < h; y += 46)
      for (let x = 30; x < w; x += 46) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 7);
        ctx.fill();
      }
    ctx.strokeStyle = "#e8b73a";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  });
  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.5),
    new THREE.MeshStandardMaterial({ map: decalTex, roughness: 0.4, metalness: 0.2 }),
  );
  decal.position.set(2.22, 0.34, FRONT);
  machine.add(decal);

  /* stitch regulator dial */
  const dial = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 40), M.black));
  dial.rotation.x = Math.PI / 2;
  dial.position.set(2.22, 1.88, FRONT + 0.05);
  machine.add(dial);
  const dialCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 32), M.chrome);
  dialCap.rotation.x = Math.PI / 2;
  dialCap.position.set(2.22, 1.88, FRONT + 0.13);
  machine.add(dialCap);
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.03), M.steel);
    tick.position.set(2.22 + Math.cos(a) * 0.17, 1.88 + Math.sin(a) * 0.17, FRONT + 0.1);
    tick.rotation.z = a - Math.PI / 2;
    machine.add(tick);
  }
  /* reverse lever */
  const lever = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.07, 0.09), M.black));
  lever.position.set(2.55, 2.28, FRONT + 0.06);
  machine.add(lever);
  const leverKnob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), M.black);
  leverKnob.position.set(2.93, 2.28, FRONT + 0.06);
  machine.add(leverKnob);

  /* ---------- head details ---------- */
  const thread1 = shadowed(
    new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 36), M.white),
  );
  thread1.rotation.x = Math.PI / 2;
  thread1.position.set(-2.72, 1.85, FRONT + 0.1);
  machine.add(thread1);
  const thread1b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24), M.steel);
  thread1b.rotation.x = Math.PI / 2;
  thread1b.position.set(-2.72, 1.85, FRONT + 0.22);
  machine.add(thread1b);
  const tens = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 32), M.chrome));
  tens.rotation.x = Math.PI / 2;
  tens.position.set(-2.6, 2.7, FRONT + 0.06);
  machine.add(tens);
  const faceplate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.5), M.chrome);
  faceplate.position.set(-3.03, 2.25, 0.05);
  machine.add(faceplate);

  /* needle assembly (moves when the machine runs) */
  const needleGroup = new THREE.Group();
  needleGroup.position.set(-2.6, 0, 0.3);
  const nBar = shadowed(
    new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.3, 20), M.chrome),
  );
  nBar.position.y = 0.95;
  needleGroup.add(nBar);
  const nClamp = shadowed(
    new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.2, 20), M.steel),
  );
  nClamp.position.y = 0.44;
  needleGroup.add(nClamp);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.34, 8), M.chrome);
  needle.position.y = 0.3;
  needleGroup.add(needle);
  machine.add(needleGroup);

  const pBar = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 20), M.steel));
  pBar.position.set(-2.33, 0.9, 0.3);
  machine.add(pBar);
  const ankle = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.09), M.steel));
  ankle.position.set(-2.38, 0.3, 0.3);
  machine.add(ankle);
  const foot = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.24), M.chrome));
  foot.position.set(-2.45, 0.075, 0.3);
  machine.add(foot);

  /* spool pin + spool */
  const pin = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 12), M.steel));
  pin.position.set(1.0, 3.58, 0);
  machine.add(pin);
  const spool = new THREE.Group();
  const sCore = shadowed(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.38, 28),
      new THREE.MeshStandardMaterial({ color: 0xc6322a, roughness: 0.8, metalness: 0 }),
    ),
  );
  spool.add(sCore);
  [-0.2, 0.2].forEach(function (y) {
    const fl = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 28), M.white));
    fl.position.y = y;
    spool.add(fl);
  });
  spool.position.set(1.0, 3.62, 0);
  machine.add(spool);
  const guide = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 10), M.steel));
  guide.position.set(-0.6, 3.48, 0);
  machine.add(guide);

  /* thread path */
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.0, 3.82, 0.0),
    new THREE.Vector3(0.2, 3.95, 0.05),
    new THREE.Vector3(-0.6, 3.72, 0.0),
    new THREE.Vector3(-1.9, 3.75, 0.25),
    new THREE.Vector3(-2.65, 3.5, 0.5),
    new THREE.Vector3(-2.74, 2.4, 0.62),
    new THREE.Vector3(-2.72, 1.85, 0.7),
    new THREE.Vector3(-2.62, 1.2, 0.36),
    new THREE.Vector3(-2.6, 0.34, 0.3),
  ]);
  const threadMesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 120, 0.009, 6, false),
    new THREE.MeshStandardMaterial({ color: 0xc6322a, roughness: 0.9 }),
  );
  threadMesh.castShadow = true;
  machine.add(threadMesh);

  /* ---------- handwheel ---------- */
  const wheel = new THREE.Group();
  wheel.position.set(3.72, 2.66, 0);
  function cylX(r: number, len: number, mat: THREE.Material, x?: number) {
    const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 56), mat));
    m.rotation.z = Math.PI / 2;
    m.position.x = x || 0;
    return m;
  }
  wheel.add(cylX(0.95, 0.2, M.black, 0));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.045, 16, 72), M.chrome);
  ring.rotation.y = Math.PI / 2;
  ring.position.x = 0.1;
  wheel.add(ring);
  const ring2 = ring.clone();
  ring2.position.x = -0.1;
  wheel.add(ring2);
  wheel.add(cylX(0.62, 0.24, M.steel, 0));
  wheel.add(cylX(0.5, 0.26, M.black, 0));
  wheel.add(cylX(0.2, 0.34, M.chrome, 0.02));
  [-1, 1].forEach(function (side) {
    for (let s = 0; s < 6; s++) {
      const an = (s / 6) * Math.PI * 2;
      const sl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.1), M.steel);
      sl.position.set(side * 0.131, Math.cos(an) * 0.35, Math.sin(an) * 0.35);
      sl.rotation.x = -an;
      wheel.add(sl);
    }
  });
  machine.add(wheel);
  const shaft = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.5, 24), M.chrome));
  shaft.rotation.z = Math.PI / 2;
  shaft.position.set(3.45, 2.66, 0);
  machine.add(shaft);

  /* ---------- ground shadow catcher ---------- */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(14, 64),
    new THREE.ShadowMaterial({ opacity: 0.4 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.72;
  ground.receiveShadow = true;
  scene.add(ground);
  const glowTex = canvasTex(256, 256, function (ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(10.5, 6),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0.3, -0.715, 0);
  scene.add(contact);

  /* ---------- state + controls ---------- */
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let running = false;
  let active = true;
  let disposed = false;
  let phase = 0;
  let raf = 0;
  let readySent = false;
  let tween: {
    fromP: THREE.Vector3;
    toP: THREE.Vector3;
    fromT: THREE.Vector3;
    toT: THREE.Vector3;
    t: number;
  } | null = null;

  function setAutoRotate(on: boolean) {
    controls.autoRotate = on;
    opts.onAutoRotateChange(on);
  }
  setAutoRotate(opts.autoRotate && !reduceMotion);

  const onStart = () => {
    if (controls.autoRotate) setAutoRotate(false);
    tween = null;
  };
  controls.addEventListener("start", onStart);

  function tweenTo(pos: THREE.Vector3, tgt: THREE.Vector3) {
    if (controls.autoRotate) setAutoRotate(false);
    tween = {
      fromP: camera.position.clone(),
      toP: pos,
      fromT: controls.target.clone(),
      toT: tgt,
      t: 0,
    };
    ensureLoop();
  }

  const VIEWS: Record<MachineView, () => [THREE.Vector3, THREE.Vector3]> = {
    front: () => [new THREE.Vector3(0.35, 2.3, 11.5), TARGET.clone()],
    side: () => [new THREE.Vector3(12.5, 2.4, 0.3), TARGET.clone()],
    top: () => [new THREE.Vector3(0.4, 13.5, 2.2), new THREE.Vector3(0.35, 0.6, 0)],
    reset: () => [HOME.clone(), TARGET.clone()],
  };

  /* ---------- sizing + loop ---------- */
  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Widen the field of view on narrow screens so the whole machine stays in frame.
    const aspect = w / h;
    camera.fov = aspect < 1 ? 40 + (1 - aspect) * 26 : aspect < 1.3 ? 42 : 34;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  let last = performance.now();
  function ease(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / TWEEN_SECONDS);
      const e = ease(tween.t);
      camera.position.lerpVectors(tween.fromP, tween.toP, e);
      controls.target.lerpVectors(tween.fromT, tween.toT, e);
      if (tween.t >= 1) tween = null;
    }
    if (running) {
      phase += dt * RUN_SPEED;
      wheel.rotation.x -= dt * RUN_SPEED;
      needleGroup.position.y = (Math.sin(phase) * 0.5 + 0.5) * 0.14;
      spool.rotation.y += dt * 4;
    }
    controls.update(dt);
    renderer.render(scene, camera);
    if (!readySent) {
      readySent = true;
      opts.onReady();
    }
    if (active && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function ensureLoop() {
    if (!raf && !disposed && active && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  const onVisibility = () => ensureLoop();
  document.addEventListener("visibilitychange", onVisibility);
  ensureLoop();

  return {
    setAutoRotate: (on) => {
      setAutoRotate(on);
      ensureLoop();
    },
    setRunning: (on) => {
      running = on;
      ensureLoop();
    },
    goTo: (view) => {
      const [p, t] = VIEWS[view]();
      tweenTo(p, t);
    },
    zoom: (direction) => {
      const offset = camera.position.clone().sub(controls.target);
      const dist = THREE.MathUtils.clamp(
        offset.length() * (direction > 0 ? 0.8 : 1.25),
        MIN_DISTANCE,
        MAX_DISTANCE,
      );
      offset.setLength(dist);
      tweenTo(controls.target.clone().add(offset), controls.target.clone());
    },
    setActive: (on) => {
      active = on;
      ensureLoop();
    },
    dispose: () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      controls.removeEventListener("start", onStart);
      controls.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : mesh.material
            ? [mesh.material]
            : [];
        for (const m of mats) {
          for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
          m.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
