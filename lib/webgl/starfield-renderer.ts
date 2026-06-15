/**
 * Native WebGL 2 animated starfield renderer for the Hero depth effect.
 * Renders transparent star particles at three depth layers with mouse parallax.
 * No external libraries — zero bundle size impact.
 */

const STAR_COUNT = 300;

const VERT_SRC = `#version 300 es
precision mediump float;

in vec2 a_pos;    // clip-space [-1, 1]
in float a_depth; // [0=near, 1=far]
in float a_phase; // twinkle phase [0, 2π]

uniform float u_time;
uniform vec2  u_mouse;  // [-1, 1] smoothed mouse offset
uniform float u_scroll; // [0, 1] scroll progress

out float v_alpha;

void main() {
  float parallax = (1.0 - a_depth) * 0.05;
  vec2 drift = vec2(0.0, a_depth * u_scroll * -0.06);
  gl_Position = vec4(a_pos + u_mouse * parallax + drift, 0.0, 1.0);

  float baseSize = mix(1.2, 3.8, 1.0 - a_depth);
  gl_PointSize = baseSize;

  float twinkle = sin(u_time * 1.2 + a_phase) * 0.18 + 0.82;
  float depthAlpha = mix(0.25, 0.92, 1.0 - a_depth);
  v_alpha = depthAlpha * twinkle;
}
`;

const FRAG_SRC = `#version 300 es
precision mediump float;

in float v_alpha;
out vec4 fragColor;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float dist = length(coord) * 2.0;
  float alpha = smoothstep(1.0, 0.25, dist) * v_alpha;
  // Warm-white star color matching the CosmicScene palette
  fragColor = vec4(1.0, 0.97, 0.93, alpha);
}
`;

export interface StarfieldController {
  /** Update smoothed mouse target (normalized, -1 to 1). */
  setMouse(x: number, y: number): void;
  /** Update scroll progress (0 to 1). */
  setScroll(progress: number): void;
  /** Stop animation loop and release WebGL resources. */
  destroy(): void;
}

function compileShader(gl: WebGL2RenderingContext, type: GLenum, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WebGLStarfield] Shader compile error:', gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vert || !frag) return null;

  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[WebGLStarfield] Program link error:', gl.getProgramInfoLog(prog));
    }
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

/** Seeded PRNG for deterministic star placement across renders. */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function createStarfieldRenderer(canvas: HTMLCanvasElement): StarfieldController | null {
  const glResult = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false });
  if (!glResult) return null;
  // Cast to non-nullable after guard — TypeScript loses closure narrowing for getContext return type.
  const gl = glResult as WebGL2RenderingContext;

  const prog = createProgram(gl);
  if (!prog) return null;

  // ----- Attribute locations -----
  const aPos   = gl.getAttribLocation(prog, 'a_pos');
  const aDepth = gl.getAttribLocation(prog, 'a_depth');
  const aPhase = gl.getAttribLocation(prog, 'a_phase');

  // ----- Uniform locations -----
  const uTime   = gl.getUniformLocation(prog, 'u_time');
  const uMouse  = gl.getUniformLocation(prog, 'u_mouse');
  const uScroll = gl.getUniformLocation(prog, 'u_scroll');

  // ----- Build star data -----
  const rand = seededRandom(42);
  const positions = new Float32Array(STAR_COUNT * 2);
  const depths    = new Float32Array(STAR_COUNT);
  const phases    = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 2]     = rand() * 2.0 - 1.0; // x
    positions[i * 2 + 1] = rand() * 2.0 - 1.0; // y
    depths[i]  = Math.pow(rand(), 0.6); // bias towards far stars
    phases[i]  = rand() * Math.PI * 2;
  }

  // ----- Upload buffers -----
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const bufPos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const bufDepth = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufDepth);
  gl.bufferData(gl.ARRAY_BUFFER, depths, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aDepth);
  gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, 0, 0);

  const bufPhase = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufPhase);
  gl.bufferData(gl.ARRAY_BUFFER, phases, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aPhase);
  gl.vertexAttribPointer(aPhase, 1, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  // ----- Canvas resize -----
  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.clientWidth  * dpr;
    const h = canvas.clientHeight * dpr;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  // ----- State -----
  let mouseTargetX = 0, mouseTargetY = 0;
  let mouseX = 0, mouseY = 0;
  let scrollProgress = 0;
  let rafId = 0;
  let startTime = performance.now();
  let destroyed = false;

  // ----- Render loop -----
  function render() {
    if (destroyed) return;
    rafId = requestAnimationFrame(render);

    // Smooth mouse towards target
    mouseX += (mouseTargetX - mouseX) * 0.05;
    mouseY += (mouseTargetY - mouseY) * 0.05;

    const t = (performance.now() - startTime) * 0.001;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.useProgram(prog);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.uniform1f(uScroll, scrollProgress);

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.POINTS, 0, STAR_COUNT);
    gl.bindVertexArray(null);
  }
  render();

  // ----- Context lost / restored -----
  const handleContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(rafId);
  };
  const handleContextRestored = () => {
    startTime = performance.now();
    render();
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);

  return {
    setMouse(x, y) {
      mouseTargetX = x;
      mouseTargetY = y;
    },
    setScroll(progress) {
      scrollProgress = progress;
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      gl.deleteBuffer(bufPos);
      gl.deleteBuffer(bufDepth);
      gl.deleteBuffer(bufPhase);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
    },
  };
}
