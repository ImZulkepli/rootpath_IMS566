/* ==========================================================
   shader.js - Full-screen WebGL background (no library).
   Flowing noise glow + a perspective grid, coloured by the
   chosen accent and light/dark mode. Falls back silently to the
   CSS dot grid if WebGL is missing or "reduce motion" is on.
   ========================================================== */
function startShader() {
  if (RT_REDUCED) return false;
  const canvas = document.createElement("canvas");
  canvas.id = "shader-bg";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return false;

  const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
uniform vec3 uAccent; uniform vec3 uBg; uniform float uLight;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.02 + 7.3; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;
  float t = uTime * 0.06;

  // slow flowing glow clouds (domain-warped noise)
  vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 - t + 4.0));
  float cloud = fbm(p * 1.4 + q * 1.6 + vec2(t, -t));
  float glow = smoothstep(0.35, 0.95, cloud);

  // perspective grid on the "floor" below the horizon
  float horizon = 0.46;
  float h = horizon - uv.y;
  float grid = 0.0;
  if (h > 0.0) {
    float depth = 0.25 / h;
    vec2 g = vec2((uv.x - 0.5) * asp.x * depth * 1.6, depth + uTime * 0.35);
    vec2 w = abs(fract(g) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.035 * depth + 0.012, min(w.x, w.y) * 0.9);
    grid = line * smoothstep(0.0, 0.18, h) * (1.0 - smoothstep(0.35, 0.5, h) * 0.6);
  }

  // soft light following the pointer
  float m = 1.0 - smoothstep(0.0, 0.45, distance(p, (uMouse - 0.5) * asp));

  float lum = glow * 0.55 + grid * 0.5 + m * 0.22;
  vec3 col;
  if (uLight > 0.5) {
    col = mix(uBg, uAccent, lum * 0.22);
    col = mix(col, vec3(0.06, 0.09, 0.16), grid * 0.08);
  } else {
    col = uBg + uAccent * lum * 0.5;
  }
  // vignette keeps edges calm so text stays readable
  float vig = smoothstep(1.15, 0.2, length(uv - 0.5) * 1.4);
  col = mix(uBg, col, 0.45 + 0.55 * vig);
  gl_FragColor = vec4(col, 1.0);
}`;

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return false;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ["uRes", "uTime", "uMouse", "uAccent", "uBg", "uLight"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  const rgb = accentRGB().split(",").map(function (v) { return Number(v) / 255; });
  const light = window.RT_MODE === "light";
  const bg = light ? [0.953, 0.961, 0.98] : [0.027, 0.043, 0.071];
  gl.uniform3f(U.uAccent, rgb[0], rgb[1], rgb[2]);
  gl.uniform3f(U.uBg, bg[0], bg[1], bg[2]);
  gl.uniform1f(U.uLight, light ? 1 : 0);

  // render at reduced resolution (cheap), the browser scales it up
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const scale = coarse ? 0.4 : 0.55;
  const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
  function resize() {
    canvas.width = Math.max(2, Math.floor(window.innerWidth * scale));
    canvas.height = Math.max(2, Math.floor(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", function (e) {
    mouse.tx = e.clientX / window.innerWidth; mouse.ty = 1 - e.clientY / window.innerHeight;
  });

  document.body.prepend(canvas);
  document.body.classList.add("has-shader");

  let running = true;
  const t0 = performance.now();
  function frame(now) {
    if (!running) return;
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  // pause when the tab is hidden (saves battery)
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });
  requestAnimationFrame(frame);
  return true;
}
