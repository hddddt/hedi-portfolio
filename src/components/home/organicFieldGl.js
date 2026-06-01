/**
 * Three independent organic masks — motion driven by uniforms from organicFieldMotion.js.
 * Calm silhouette, living interior: soft superellipse fields + internal density.
 */

const VERTEX_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_light;
uniform float u_globalOpacity;
uniform float u_globalScale;
uniform float u_extraC;
uniform float u_flowB;
uniform float u_time;
uniform vec3 u_opacity;
uniform vec3 u_scale;
uniform vec2 u_centerA;
uniform vec2 u_centerB;
uniform vec2 u_centerC;
uniform vec2 u_radiiA;
uniform vec2 u_radiiB;
uniform vec2 u_radiiC;
uniform vec3 u_rotation;
uniform float u_organic;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.86, -0.5, 0.5, 0.86);
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.05 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float superMetric(vec2 p, float n) {
  p = abs(p);
  return pow(pow(p.x, n) + pow(p.y, n), 1.0 / n);
}

vec2 rotLocal(vec2 p, float rot) {
  float c = cos(rot);
  float s = sin(rot);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

/* Low-frequency edge nudge — no angular lobes */
float broadEdgeNudge(vec2 p, float seed, float amp) {
  return (vnoise(p * 1.35 + vec2(seed * 2.3, seed * 0.9)) - 0.5) * amp;
}

float angularWobble(float ang, float seed, float amp) {
  return (
    sin(ang * 2.0 + seed * 2.1) * amp * 0.55 +
    sin(ang * 3.0 - seed * 0.7) * amp * 0.45
  );
}

vec2 organicWarp(vec2 p, float seed, float rot, float strength) {
  float g = strength * 0.012 * (0.42 + u_organic * 0.38);
  float t = u_time * 0.011;
  return vec2(
    vnoise(p * 0.95 + vec2(seed * 1.3 + t, rot * 0.08)) - 0.5,
    vnoise(p * 0.95 + vec2(seed * 2.1 - t * 0.7, rot * 0.1)) - 0.5
  ) * g;
}

float radialBreath(vec2 p, float seed, float rot, float amp) {
  float r = length(p);
  float flow = sin(r * 2.1 - rot * 0.35 + seed * 1.1 + u_time * 0.08) * amp;
  float mist = (vnoise(p * 1.35 + vec2(seed * 0.55, u_time * 0.013)) - 0.5) * amp * 0.65;
  return flow + mist;
}

/* Soft edge inside silhouette only — no outer halo / transparent ring */
float softMask(float d, float edgeStart, float edgeEnd) {
  return 1.0 - smoothstep(edgeStart, edgeEnd, d);
}

/**
 * Core silhouette — shapeN high = round; wobbleAmp low = stable edge.
 */
float fieldMaskCore(
  vec2 uv,
  vec2 center,
  vec2 radii,
  float scale,
  float shapeN,
  float seed,
  float rot,
  float wobbleAmp,
  float edgeStart,
  float edgeEnd,
  float warpStrength
) {
  vec2 p = rotLocal(uv - center, -rot) / max(radii * scale, vec2(0.0008));
  p += organicWarp(p, seed, rot, warpStrength);

  float ang = atan(p.y, p.x);
  float wobble = angularWobble(ang, seed, wobbleAmp);
  float nudge = broadEdgeNudge(p, seed, wobbleAmp * 0.55);
  float breath = radialBreath(p, seed, rot, wobbleAmp * 0.35);

  float d = superMetric(p / max(1.0 + wobble + nudge + breath, 0.94), shapeN);
  return softMask(d, edgeStart, edgeEnd);
}

float fieldMaskGreen(vec2 uv, vec2 center, vec2 radii, float scale, float seed, float rot) {
  float shapeN = mix(2.58, 2.82, u_organic * 0.35);
  return fieldMaskCore(
    uv, center, radii, scale, shapeN, seed, rot,
    0.0028, 0.94, 1.0, 0.55
  );
}

float fieldMaskBlue(vec2 uv, vec2 center, vec2 radii, float scale, float seed, float rot) {
  float shapeN = mix(2.42, 2.62, u_organic * 0.4);
  return fieldMaskCore(
    uv, center, radii, scale, shapeN, seed, rot,
    0.0042, 0.945, 1.01, 0.72
  );
}

float fieldMaskYellow(vec2 uv, vec2 center, vec2 radii, float scale, float seed, float rot) {
  float shapeN = mix(2.46, 2.58, u_organic * 0.25);
  return fieldMaskCore(
    uv, center, radii, scale, shapeN, seed, rot,
    0.0012, 0.94, 1.0, 0.35
  );
}

float internalDensity(vec2 p, float seed, float amp) {
  vec2 drift = vec2(u_time * 0.014, u_time * 0.009);
  float cloud = fbm(p * 1.55 + drift + vec2(seed * 1.7, seed * 0.4));
  float layer = fbm(p * 2.35 - drift * 0.6 + vec2(seed * 2.9, 3.1));
  return 1.0 + amp * ((cloud - 0.5) * 0.07 + (layer - 0.5) * 0.04);
}

vec3 internalHighlight(vec2 p, float seed, vec3 tint, float amp) {
  vec2 flow = vec2(u_time * 0.01, -u_time * 0.007);
  float h = fbm(p * 2.05 + flow + vec2(seed * 0.8, 4.2));
  return tint * max(0.0, h - 0.52) * amp;
}

vec3 heroChroma(vec3 col, float sat) {
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  return clamp(mix(vec3(l), col, sat), 0.0, 1.0);
}

vec3 meshGreenHero(vec2 p, float rot) {
  float r = length(p);
  float cloud = (fbm(p * 1.6 + vec2(rot * 0.1, u_time * 0.008)) - 0.5) * 0.04;
  float micro = (vnoise(p * 6.5 + vec2(rot * 0.15, u_time * 0.012)) - 0.5) * 0.018;
  float t = clamp(r * 0.5 + cloud + micro, 0.0, 1.0);
  vec3 base = vec3(0.36, 0.72, 0.52);
  vec3 deep = vec3(0.26, 0.58, 0.42);
  vec3 shade = vec3(0.32, 0.66, 0.48);
  vec3 mid = base;
  vec3 lift = vec3(0.44, 0.78, 0.56);
  vec3 hi = vec3(0.52, 0.86, 0.6);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.34, t));
  col = mix(col, mid, smoothstep(0.28, 0.58, t));
  col = mix(col, lift, smoothstep(0.5, 0.8, t));
  col = mix(col, hi, smoothstep(0.72, 1.0, t));
  float dome = 1.0 - smoothstep(0.34, 1.05, r);
  col *= 0.94 + dome * 0.08;
  col += internalHighlight(p, 1.3, vec3(0.1, 0.2, 0.12), 0.09);
  float grain = (vnoise(p * 16.0 + vec2(rot * 0.12, r)) - 0.5) * 0.02;
  col += vec3(grain * 0.008, grain * 0.022, grain * 0.016);
  return heroChroma(col, 1.22) * 1.14;
}

vec3 meshGreen(vec2 p, float rot) {
  if (u_light > 0.5) return meshGreenHero(p, rot);
  float r = length(p);
  float ang = atan(p.y, p.x);
  float cloud = (fbm(p * 1.75 + vec2(rot * 0.12, u_time * 0.01)) - 0.5) * 0.06;
  float micro = (vnoise(p * 7.0 + vec2(rot * 0.2, u_time * 0.016)) - 0.5) * 0.028;
  float t = clamp(r * 0.52 + p.y * 0.06 + cloud + micro, 0.0, 1.0);
  vec3 deep = vec3(0.02, 0.42, 0.34);
  vec3 shade = vec3(0.06, 0.58, 0.46);
  vec3 mid = vec3(0.12, 0.76, 0.58);
  vec3 lift = vec3(0.28, 0.9, 0.68);
  vec3 hi = vec3(0.48, 0.98, 0.78);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.32, t));
  col = mix(col, mid, smoothstep(0.24, 0.56, t));
  col = mix(col, lift, smoothstep(0.48, 0.78, t));
  col = mix(col, hi, smoothstep(0.72, 1.0, t));

  float urBias = smoothstep(-0.15, 0.55, dot(normalize(p + vec2(0.08, -0.12)), vec2(0.72, -0.68)));
  vec3 tealLift = vec3(0.18, 0.88, 0.72);
  col = mix(col, tealLift, urBias * 0.08 * (1.0 - r * 0.35));

  float dome = 1.0 - smoothstep(0.32, 1.05, r);
  float nz = sqrt(max(0.1, dome * (1.0 - r * r * 0.26)));
  vec2 pn = r > 0.001 ? p / max(r, 0.001) : vec2(1.0, 0.0);
  float xyLen = max(0.22, sqrt(max(0.0, 1.0 - nz * nz)));
  vec3 N = normalize(vec3(pn.x * xyLen, pn.y * xyLen, nz));
  float la = rot + 0.62;
  vec3 L = normalize(vec3(cos(la), sin(la) * 0.48, 0.82));
  vec3 V = vec3(0.02, -0.03, 1.0);
  float ndl = clamp(dot(N, L), 0.0, 1.0);
  float ndv = clamp(dot(N, normalize(V)), 0.0, 1.0);
  float rim = pow(1.0 - ndv, 2.8) * dome * 0.14;
  float spec = pow(max(dot(reflect(-L, N), normalize(V)), 0.0), 18.0) * dome * 0.07;
  col *= 0.88 + ndl * 0.32;
  col += hi * rim * 0.42;
  col += hi * spec * 0.48;

  float vein = vnoise(vec2(r * 1.8 - rot * 0.22, ang * 0.28)) * 0.02 * (1.0 - r * 0.35);
  col += vec3(0.02, 0.08, 0.06) * vein;
  col += internalHighlight(p, 1.3, vec3(0.14, 0.38, 0.28), 0.16);
  float grain = (vnoise(p * 18.0 + vec2(rot * 0.15, r)) - 0.5) * 0.032;
  col += vec3(grain * 0.01, grain * 0.04, grain * 0.028);
  return col * 1.08;
}

vec3 meshBlueHero(vec2 p, float flow, float rot) {
  float r = length(p);
  float cloud = (fbm(p * 1.75 + vec2(flow * 0.03, u_time * 0.01)) - 0.5) * 0.04;
  float micro = (vnoise(p * 7.5 + vec2(rot * 0.2, flow * 0.03)) - 0.5) * 0.02;
  float t = clamp(r * 0.54 + cloud + micro, 0.0, 1.0);
  vec3 base = vec3(0.34, 0.46, 0.78);
  vec3 deep = vec3(0.26, 0.36, 0.68);
  vec3 shade = vec3(0.3, 0.42, 0.74);
  vec3 mid = base;
  vec3 lift = vec3(0.42, 0.54, 0.86);
  vec3 hi = vec3(0.5, 0.62, 0.92);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.32, t));
  col = mix(col, mid, smoothstep(0.26, 0.56, t));
  col = mix(col, lift, smoothstep(0.48, 0.78, t));
  col = mix(col, hi, smoothstep(0.7, 1.0, t));
  float dome = 1.0 - smoothstep(0.36, 1.08, r);
  col *= 0.92 + dome * 0.1;
  col += internalHighlight(p, 2.9, vec3(0.14, 0.2, 0.36), 0.09);
  float grain = (vnoise(p * 18.0 + u_time * 0.015) - 0.5) * 0.018;
  col += vec3(grain * 0.012, grain * 0.018, grain * 0.032);
  return heroChroma(col, 1.2) * 1.12;
}

vec3 meshBlue(vec2 p, float flow, float rot) {
  if (u_light > 0.5) return meshBlueHero(p, flow, rot);
  float r = length(p);
  float cloud = (fbm(p * 1.72 + vec2(flow * 0.035, u_time * 0.009)) - 0.5) * 0.038;
  float micro = (vnoise(p * 7.8 + vec2(rot * 0.2, flow * 0.03)) - 0.5) * 0.024;
  float t = clamp(r * 0.56 + cloud + micro * 0.5, 0.0, 1.0);
  vec3 deep = vec3(0.14, 0.22, 0.58);
  vec3 shade = vec3(0.18, 0.3, 0.72);
  vec3 mid = vec3(0.26, 0.4, 0.82);
  vec3 lift = vec3(0.4, 0.56, 0.9);
  vec3 hi = vec3(0.54, 0.68, 0.96);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.28, t));
  col = mix(col, mid, smoothstep(0.22, 0.52, t));
  col = mix(col, lift, smoothstep(0.44, 0.72, t));
  col = mix(col, hi, smoothstep(0.66, 1.0, t));

  float dome = 1.0 - smoothstep(0.36, 1.08, r);
  col *= 0.9 + dome * 0.14;

  float grain = (vnoise(p * 17.0 + u_time * 0.014) - 0.5) * 0.016;
  col += vec3(grain * 0.01, grain * 0.016, grain * 0.028);
  return col * 1.08;
}

vec3 meshAmberHero(vec2 p) {
  float r = length(p);
  float cloud = (fbm(p * 1.7 + vec2(u_time * 0.009, 4.6)) - 0.5) * 0.035;
  float micro = (vnoise(p * 8.0) - 0.5) * 0.02;
  float t = clamp(r * 0.52 + micro + cloud * 0.3, 0.0, 1.0);
  vec3 base = vec3(0.86, 0.58, 0.24);
  vec3 deep = vec3(0.72, 0.46, 0.16);
  vec3 shade = vec3(0.78, 0.52, 0.2);
  vec3 mid = base;
  vec3 lift = vec3(0.94, 0.66, 0.32);
  vec3 hi = vec3(0.98, 0.76, 0.42);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.34, t));
  col = mix(col, mid, smoothstep(0.28, 0.56, t));
  col = mix(col, lift, smoothstep(0.5, 0.78, t));
  col = mix(col, hi, smoothstep(0.7, 1.0, t));
  float dome = 1.0 - smoothstep(0.36, 1.06, r);
  col *= 0.9 + dome * 0.08;
  col += internalHighlight(p, 4.6, vec3(0.18, 0.12, 0.04), 0.08);
  float grain = (vnoise(p * 17.0) - 0.5) * 0.016;
  col += vec3(grain * 0.028, grain * 0.02, grain * 0.008);
  return heroChroma(col, 1.18) * 1.1;
}

vec3 meshAmber(vec2 p) {
  if (u_light > 0.5) return meshAmberHero(p);
  float r = length(p);
  float ang = atan(p.y, p.x);
  float cloud = (fbm(p * 1.85 + vec2(u_time * 0.011, 4.6)) - 0.5) * 0.06;
  float micro = (vnoise(p * 9.0) - 0.5) * 0.036;
  float grad = clamp(p.x * 0.28 - p.y * 0.18 + 0.1 + cloud * 0.35, 0.0, 1.0);
  float t = clamp(r * 0.54 + p.y * 0.04 + micro, 0.0, 1.0);
  vec3 deep = vec3(0.62, 0.32, 0.06);
  vec3 shade = vec3(0.82, 0.48, 0.1);
  vec3 mid = vec3(0.96, 0.62, 0.16);
  vec3 lift = vec3(1.0, 0.76, 0.28);
  vec3 hi = vec3(1.0, 0.88, 0.42);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.32, t));
  col = mix(col, mid, smoothstep(0.24, 0.54, t));
  col = mix(col, lift, smoothstep(0.48, 0.76, t));
  col = mix(col, hi, smoothstep(0.68, 1.0, t));
  vec3 glow = vec3(1.0, 0.72, 0.32);
  col = mix(col, glow, grad * 0.18);

  col += internalHighlight(p, 4.6, vec3(0.28, 0.16, 0.05), 0.13);
  float vein = vnoise(vec2(ang * 1.8 + r * 2.8, r * 4.6)) * 0.032;
  col += vec3(0.08, 0.04, 0.01) * vein;
  float grain = (vnoise(p * 19.0) - 0.5) * 0.03;
  col += vec3(grain * 0.05, grain * 0.035, grain * 0.012);
  return col * 1.08;
}

vec4 layerFromMask(float mask, vec3 rgb, float opacity, vec2 pLocal, float seed, float internalAmp) {
  if (mask < 0.004) return vec4(0.0);
  float dens = internalDensity(pLocal, seed, internalAmp);
  float densN = clamp(dens, 0.94, 1.06);
  vec3 col = rgb * mix(1.06, 1.0, densN);
  col *= 1.0 + (densN - 1.0) * 2.8;
  float a = mask * opacity * u_globalOpacity;
  a *= mix(1.0, densN, 0.12);
  a = clamp(a, 0.0, u_light > 0.5 ? 0.9 : 0.88);
  return vec4(col * a, a);
}

vec4 over(vec4 dst, vec4 src) {
  return src + dst * (1.0 - src.a);
}

vec4 screenLayer(vec4 dst, vec4 src) {
  if (src.a < 0.0001) return dst;
  vec3 srcUn = src.rgb / src.a;
  vec3 dstUn = dst.a > 0.0001 ? dst.rgb / dst.a : vec3(0.0);
  vec3 screenUn = 1.0 - (1.0 - srcUn) * (1.0 - dstUn);
  vec4 screened = vec4(screenUn * src.a, src.a);
  return over(dst, screened);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  vec2 radA = u_radiiA * u_globalScale;
  vec2 radB = u_radiiB * u_globalScale;
  vec2 radC = u_radiiC * u_globalScale;

  float maskA = fieldMaskGreen(uv, u_centerA, radA, u_scale.x, 1.3, u_rotation.x);
  float maskB = fieldMaskBlue(uv, u_centerB, radB, u_scale.y, 2.9, u_rotation.y);
  float maskC = fieldMaskYellow(uv, u_centerC, radC, u_scale.z, 4.6, u_rotation.z);

  vec2 pA = rotLocal(uv - u_centerA, -u_rotation.x) / max(radA * u_scale.x, vec2(0.0008));
  vec2 pB = rotLocal(uv - u_centerB, -u_rotation.y) / max(radB * u_scale.y, vec2(0.0008));
  vec2 pC = rotLocal(uv - u_centerC, -u_rotation.z) / max(radC * u_scale.z, vec2(0.0008));

  vec3 rgbA = meshGreen(pA, u_rotation.x);
  vec3 rgbB = meshBlue(pB, u_flowB, u_rotation.y);
  vec3 rgbC = meshAmber(pC);

  if (u_light > 0.5) {
    rgbA = mix(rgbA, vec3(1.0), 0.0);
    rgbB = mix(rgbB, vec3(1.0), 0.0);
    rgbC = mix(rgbC, vec3(1.0), 0.0);
  } else {
    rgbA *= 1.04;
    rgbB *= 1.06;
    rgbC *= 1.03;
  }

  float opacityC = u_opacity.z * u_extraC;
  if (u_light > 0.5) {
    opacityC = min(opacityC * 1.0, 0.62);
  }

  vec4 layerB = layerFromMask(maskB, rgbB, u_opacity.y, pB, 2.9, 0.04);
  vec4 layerC = layerFromMask(maskC, rgbC, opacityC, pC, 4.6, 0.06);

  vec4 acc = vec4(0.0);
  acc = over(acc, layerFromMask(maskA, rgbA, u_opacity.x, pA, 1.3, 0.08));
  /* Light opening: over; dark chapters: over for blue (atmospheric), screen for amber accent */
  if (u_light > 0.5) {
    acc = over(acc, layerB);
    acc = over(acc, layerC);
  } else {
    acc = screenLayer(acc, layerB);
    acc = screenLayer(acc, layerC);
  }

  float grain = (vnoise(uv * 380.0 + vec2(9.2, 31.0) + u_time * 0.02) - 0.5) * 0.024;
  acc.rgb += vec3(grain * 0.018, grain * 0.022, grain * 0.016) * u_globalOpacity * smoothstep(0.12, 0.42, acc.a);

  gl_FragColor = vec4(clamp(acc.rgb, 0.0, 1.0), clamp(acc.a, 0.0, 1.0));
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[OrganicField]', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[OrganicField]', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * @param {HTMLCanvasElement} canvas
 */
export function createOrganicFieldRenderer(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) return null;

  const program = createProgram(gl);
  if (!program) return null;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'a_position');
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uLight = gl.getUniformLocation(program, 'u_light');
  const uGlobalOpacity = gl.getUniformLocation(program, 'u_globalOpacity');
  const uGlobalScale = gl.getUniformLocation(program, 'u_globalScale');
  const uExtraC = gl.getUniformLocation(program, 'u_extraC');
  const uFlowB = gl.getUniformLocation(program, 'u_flowB');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uOpacity = gl.getUniformLocation(program, 'u_opacity');
  const uScale = gl.getUniformLocation(program, 'u_scale');
  const uCenterA = gl.getUniformLocation(program, 'u_centerA');
  const uCenterB = gl.getUniformLocation(program, 'u_centerB');
  const uCenterC = gl.getUniformLocation(program, 'u_centerC');
  const uRadiiA = gl.getUniformLocation(program, 'u_radiiA');
  const uRadiiB = gl.getUniformLocation(program, 'u_radiiB');
  const uRadiiC = gl.getUniformLocation(program, 'u_radiiC');
  const uRotation = gl.getUniformLocation(program, 'u_rotation');
  const uOrganic = gl.getUniformLocation(program, 'u_organic');

  gl.useProgram(program);
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    gl,
    draw(state) {
      const {
        width,
        height,
        light,
        globalOpacity,
        globalScale,
        extraC,
        flowB,
        time = 0,
        opacity,
        scale,
        centerA,
        centerB,
        centerC,
        radiiA,
        radiiB,
        radiiC,
        rotation,
        organic = 0,
      } = state;

      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uResolution, width, height);
      gl.uniform1f(uLight, light ? 1 : 0);
      gl.uniform1f(uGlobalOpacity, globalOpacity);
      gl.uniform1f(uGlobalScale, globalScale);
      gl.uniform1f(uExtraC, extraC);
      gl.uniform1f(uFlowB, flowB);
      gl.uniform1f(uTime, time);
      gl.uniform3f(uOpacity, opacity.a, opacity.b, opacity.c);
      gl.uniform3f(uScale, scale.a, scale.b, scale.c);
      gl.uniform2f(uCenterA, centerA.x, centerA.y);
      gl.uniform2f(uCenterB, centerB.x, centerB.y);
      gl.uniform2f(uCenterC, centerC.x, centerC.y);
      gl.uniform2f(uRadiiA, radiiA.x, radiiA.y);
      gl.uniform2f(uRadiiB, radiiB.x, radiiB.y);
      gl.uniform2f(uRadiiC, radiiC.x, radiiC.y);
      gl.uniform3f(
        uRotation,
        rotation?.a ?? 0,
        rotation?.b ?? 0,
        rotation?.c ?? 0,
      );
      gl.uniform1f(uOrganic, organic);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    },
  };
}
