/**
 * Three independent organic masks — motion driven by uniforms from organicFieldMotion.js.
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
uniform vec3 u_opacity;
uniform vec3 u_scale;
uniform vec2 u_centerA;
uniform vec2 u_centerB;
uniform vec2 u_centerC;
uniform vec2 u_radiiA;
uniform vec2 u_radiiB;
uniform vec2 u_radiiC;
uniform vec3 u_rotation;

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

float superMetric(vec2 p, float n) {
  p = abs(p);
  return pow(pow(p.x, n) + pow(p.y, n), 1.0 / n);
}

vec2 rotLocal(vec2 p, float rot) {
  float c = cos(rot);
  float s = sin(rot);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

/* Static readable silhouette — optional tilt via rot (radians) */
float fieldMask(vec2 uv, vec2 center, vec2 radii, float scale, float shapeN, float seed, float rot) {
  vec2 p = rotLocal(uv - center, -rot) / max(radii * scale, vec2(0.0008));
  float ang = atan(p.y, p.x);
  float wobble =
    sin(ang * 2.0 + seed * 2.1) * 0.009 +
    sin(ang * 3.0 - seed * 0.7) * 0.005;
  float nudge = (vnoise(vec2(ang * 1.2, seed * 3.7)) - 0.5) * 0.005;
  float detail = (vnoise(p * 9.0 + vec2(seed * 2.1, ang * 0.5)) - 0.5) * 0.014;
  float d = superMetric(p / max(1.0 + wobble + nudge + detail, 0.88), shapeN);
  return 1.0 - smoothstep(0.94, 1.08, d);
}

/* Green hero — softer edge, nearer-circle superellipse */
float fieldMaskRound(vec2 uv, vec2 center, vec2 radii, float scale, float seed, float rot) {
  vec2 p = rotLocal(uv - center, -rot) / max(radii * scale, vec2(0.0008));
  float ang = atan(p.y, p.x);
  float wobble = sin(ang * 2.0 + seed * 2.1) * 0.004;
  float detail = (vnoise(p * 8.0 + vec2(seed * 2.1, ang * 0.5)) - 0.5) * 0.007;
  float d = superMetric(p / max(1.0 + wobble + detail, 0.94), 1.88);
  return 1.0 - smoothstep(0.93, 1.06, d);
}

vec3 meshGreen(vec2 p) {
  float r = length(p);
  float ang = atan(p.y, p.x);
  float micro = (vnoise(p * 11.0) - 0.5) * 0.09;
  float t = clamp(r * 0.62 + p.y * 0.2 + micro, 0.0, 1.0);
  vec3 deep = vec3(0.025, 0.30, 0.16);
  vec3 shade = vec3(0.06, 0.46, 0.26);
  vec3 mid = vec3(0.12, 0.58, 0.36);
  vec3 lift = vec3(0.28, 0.74, 0.52);
  vec3 hi = vec3(0.58, 0.90, 0.70);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.28, t));
  col = mix(col, mid, smoothstep(0.22, 0.52, t));
  col = mix(col, lift, smoothstep(0.46, 0.78, t));
  col = mix(col, hi, smoothstep(0.72, 1.0, t));
  float vein = vnoise(vec2(ang * 2.8 + r * 3.2, r * 5.0)) * 0.07;
  col += vec3(0.03, 0.07, 0.04) * vein;
  return col;
}

vec3 meshBlue(vec2 p, float flow) {
  float r = length(p);
  float ang = atan(p.y, p.x);
  float drift = sin(flow) * 0.05 + cos(flow * 0.73) * 0.035;
  float micro = (vnoise(p * 10.0) - 0.5) * 0.08;
  float t = clamp(r * 0.64 - p.x * 0.1 + drift + micro, 0.0, 1.0);
  vec3 deep = vec3(0.03, 0.10, 0.38);
  vec3 shade = vec3(0.05, 0.20, 0.58);
  vec3 mid = vec3(0.10, 0.34, 0.72);
  vec3 lift = vec3(0.32, 0.58, 0.94);
  vec3 hi = vec3(0.62, 0.82, 1.0);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.3, t));
  col = mix(col, mid, smoothstep(0.24, 0.54, t));
  col = mix(col, lift, smoothstep(0.48, 0.78, t));
  col = mix(col, hi, smoothstep(0.7, 1.0, t));
  float vein = vnoise(vec2(ang * 2.6 + r * 3.0, r * 4.8)) * 0.06;
  col += vec3(0.02, 0.04, 0.08) * vein;
  return col;
}

vec3 meshAmber(vec2 p) {
  float r = length(p);
  float ang = atan(p.y, p.x);
  float micro = (vnoise(p * 10.5) - 0.5) * 0.09;
  float t = clamp(r * 0.66 + p.y * 0.12 + micro, 0.0, 1.0);
  vec3 deep = vec3(0.42, 0.2, 0.04);
  vec3 shade = vec3(0.58, 0.34, 0.06);
  vec3 mid = vec3(0.78, 0.52, 0.1);
  vec3 lift = vec3(0.94, 0.7, 0.18);
  vec3 hi = vec3(1.0, 0.88, 0.38);
  vec3 col = mix(deep, shade, smoothstep(0.0, 0.28, t));
  col = mix(col, mid, smoothstep(0.22, 0.52, t));
  col = mix(col, lift, smoothstep(0.46, 0.76, t));
  col = mix(col, hi, smoothstep(0.68, 1.0, t));
  float vein = vnoise(vec2(ang * 2.4 + r * 3.4, r * 5.2)) * 0.07;
  col += vec3(0.05, 0.03, 0.0) * vein;
  return col;
}

vec4 layerFromMask(float mask, vec3 rgb, float opacity) {
  if (mask < 0.0005) return vec4(0.0);
  float a = mask * opacity * u_globalOpacity;
  a = clamp(a, 0.0, 0.85);
  return vec4(rgb * a, a);
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

  float maskA = fieldMaskRound(uv, u_centerA, radA, u_scale.x, 1.3, u_rotation.x);
  float maskB = fieldMask(uv, u_centerB, radB, u_scale.y, 2.48, 2.9, u_rotation.y);
  float maskC = fieldMask(uv, u_centerC, radC, u_scale.z, 1.98, 4.6, u_rotation.z);

  vec2 pA = rotLocal(uv - u_centerA, -u_rotation.x) / max(radA * u_scale.x, vec2(0.0008));
  vec2 pB = rotLocal(uv - u_centerB, -u_rotation.y) / max(radB * u_scale.y, vec2(0.0008));
  vec2 pC = rotLocal(uv - u_centerC, -u_rotation.z) / max(radC * u_scale.z, vec2(0.0008));

  vec3 rgbA = meshGreen(pA);
  vec3 rgbB = meshBlue(pB, u_flowB);
  vec3 rgbC = meshAmber(pC);

  if (u_light > 0.5) {
    rgbA = mix(rgbA, vec3(1.0), 0.03);
    rgbB = mix(rgbB, vec3(1.0), 0.03);
    rgbC = mix(rgbC, vec3(1.0), 0.015);
    rgbC *= vec3(1.06, 1.0, 0.9);
  }

  float opacityC = u_opacity.z * u_extraC;
  if (u_light > 0.5) {
    opacityC = min(opacityC * 1.06, 0.82);
  }

  vec4 acc = vec4(0.0);
  acc = over(acc, layerFromMask(maskA, rgbA, u_opacity.x));
  acc = screenLayer(acc, layerFromMask(maskB, rgbB, u_opacity.y));
  acc = screenLayer(acc, layerFromMask(maskC, rgbC, opacityC));

  float grain = (vnoise(uv * 420.0 + vec2(9.2, 31.0)) - 0.5) * 0.045;
  float greenDetail = maskA * (vnoise(pA * 14.0) - 0.5) * 0.04;
  float blueDetail = maskB * (vnoise(pB * 14.0) - 0.5) * 0.038;
  float amberDetail = maskC * (vnoise(pC * 14.0) - 0.5) * 0.04;
  acc.rgb += grain * u_globalOpacity * smoothstep(0.03, 0.22, acc.a);
  acc.rgb += vec3(0.02, 0.05, 0.03) * greenDetail * u_opacity.x * u_globalOpacity;
  acc.rgb += vec3(0.02, 0.03, 0.06) * blueDetail * u_opacity.y * u_globalOpacity;
  acc.rgb += vec3(0.05, 0.03, 0.01) * amberDetail * u_opacity.z * u_globalOpacity;

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
  const uOpacity = gl.getUniformLocation(program, 'u_opacity');
  const uScale = gl.getUniformLocation(program, 'u_scale');
  const uCenterA = gl.getUniformLocation(program, 'u_centerA');
  const uCenterB = gl.getUniformLocation(program, 'u_centerB');
  const uCenterC = gl.getUniformLocation(program, 'u_centerC');
  const uRadiiA = gl.getUniformLocation(program, 'u_radiiA');
  const uRadiiB = gl.getUniformLocation(program, 'u_radiiB');
  const uRadiiC = gl.getUniformLocation(program, 'u_radiiC');
  const uRotation = gl.getUniformLocation(program, 'u_rotation');

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
        opacity,
        scale,
        centerA,
        centerB,
        centerC,
        radiiA,
        radiiB,
        radiiC,
        rotation,
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
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    },
  };
}
