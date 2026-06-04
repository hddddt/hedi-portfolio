/**
 * Opening hero — three distinct pigment bodies + SG flow, alpha-masked.
 * #73bfc4 · #ff810a · #8da0ce
 */

export const OPENING_HERO_VERTEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  return 2.2 * mix(n_yz.x, n_yz.y, fade_xyz.x);
}

uniform float uTime;
uniform float uNoiseDensity;
uniform float uNoiseStrength;
uniform float uFrequency;

varying vec3 vPos;
varying float vDistort;

void main() {
  float t = uTime;
  vec3 noisePos = position * uNoiseDensity;
  float distortion = cnoise(
    noisePos + vec3(t * uFrequency * 0.08, t * uFrequency * 0.055, t * 0.14)
  );
  vDistort = distortion;
  vec3 pos = position + normal * distortion * uNoiseStrength;
  vPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const OPENING_HERO_FRAGMENT = /* glsl */ `
precision highp float;

uniform float uC1r; uniform float uC1g; uniform float uC1b;
uniform float uC2r; uniform float uC2g; uniform float uC2b;
uniform float uC3r; uniform float uC3g; uniform float uC3b;
uniform float uTime;
uniform float uAmplitude;
uniform float uNoiseDensity;
uniform float uMaskRadius;
uniform float uMaskSoftness;
uniform float uCompound;
uniform float uSeparation;
uniform float uCoreTension;
uniform float uBluePressure;
uniform float uAmberAccent;
uniform float uGrain;
uniform float uGlobalOpacity;
uniform float uBrightness;
uniform float uContrast;

varying vec3 vPos;
varying float vDistort;

float h21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 screenBlend(vec3 a, vec3 b, float w) {
  vec3 s = 1.0 - (1.0 - a) * (1.0 - b);
  return mix(a, s, clamp(w, 0.0, 1.0));
}

float bodyMask(vec2 uv, vec2 center, vec2 radii, float sharp) {
  vec2 d = (uv - center) / radii;
  float r = length(d);
  float edge = 1.0 - smoothstep(0.62 + sharp * 0.05, 0.9 + sharp * 0.04, r);
  return pow(edge, 1.05);
}

float clusterGate(vec2 uv, vec2 hub, float radius, float softness) {
  float d = length((uv - hub) * vec2(1.0, 0.88));
  return 1.0 - smoothstep(radius - softness * 0.65, radius + softness * 0.4, d);
}

vec3 flowTint(vec3 base, vec3 pos, float distort, float time, float axis) {
  float wave = sin(pos.x * 2.4 + pos.y * 1.8 + time * 0.5) * uAmplitude * 0.04;
  float flow = distort * 0.22 + wave + sin(pos.z * 1.6 + time * 0.35) * 0.06;
  float t = pos.x * axis + pos.y * (1.0 - axis) + flow;
  return mix(base, base * 1.06, smoothstep(-0.15, 0.2, t));
}

void main() {
  vec3 teal = vec3(uC1r, uC1g, uC1b);
  vec3 periwinkle = vec3(uC2r, uC2g, uC2b);
  vec3 orange = vec3(uC3r, uC3g, uC3b);

  vec2 uv = vPos.xy * 0.3 + vec2(vDistort * 0.04, vDistort * 0.025);
  vec2 hub = vec2(-0.03, 0.012);
  float sharp = uSeparation * 0.4 + uCompound * 0.2;

  vec2 greenC = vec2(-0.22, 0.055);
  vec2 blueC = vec2(0.09, 0.0);
  vec2 amberC = vec2(0.0, -0.085);

  float greenM = bodyMask(uv, greenC, vec2(0.5, 0.44), sharp);
  float blueM = bodyMask(uv, blueC, vec2(0.31, 0.28), sharp + 0.04);
  float amberM = bodyMask(uv, amberC, vec2(0.13, 0.12), sharp + 0.06);

  vec3 colG = flowTint(teal, vPos, vDistort, uTime, 0.55);
  vec3 colB = flowTint(periwinkle, vPos, vDistort, uTime, 0.35);
  vec3 colA = flowTint(orange, vPos, vDistort, uTime, 0.2);

  float wG = greenM * 1.15;
  float wB = blueM * (0.95 + uBluePressure * 0.35);
  float wA = amberM * (0.9 + uAmberAccent * 0.45);
  float wSum = wG + wB + wA + 0.001;

  vec3 pigment = (colG * wG + colB * wB + colA * wA) / wSum;

  float seamGB = greenM * blueM;
  float seamGO = greenM * amberM;
  float seamBO = blueM * amberM;
  float seamAll = seamGB * amberM;

  pigment = mix(pigment, screenBlend(colG, colB, 0.55), seamGB * (0.7 + uCoreTension * 0.22));
  pigment = mix(pigment, screenBlend(colG, colA, 0.5), seamGO * (0.62 + uAmberAccent * 0.28));
  pigment = mix(pigment, screenBlend(colB, colA, 0.48), seamBO * (0.55 + uAmberAccent * 0.25));
  pigment = mix(pigment, screenBlend(screenBlend(colG, colB, 0.45), colA, 0.42), seamAll * 0.65);

  float cluster = max(greenM, max(blueM * 0.97, amberM * 0.92));
  float gate = clusterGate(uv, hub, uMaskRadius, uMaskSoftness);
  float alpha = cluster * gate;

  float rim = length((uv - hub) * vec2(1.0, 0.88));
  alpha *= 1.0 - smoothstep(uMaskRadius * 0.9, uMaskRadius * 0.98, rim) * 0.38;

  float luma = dot(pigment, vec3(0.299, 0.587, 0.114));
  pigment = mix(vec3(luma), pigment, 1.18);
  pigment = mix(pigment, pigment * 1.04, uContrast - 0.9);
  pigment *= uBrightness;

  float grain = (h21(gl_FragCoord.xy * 1.35 + vec2(uTime * 0.4)) - 0.5) * uGrain;
  pigment += grain * alpha;

  alpha = clamp(alpha * uGlobalOpacity, 0.0, 1.0);
  if (alpha < 0.004) discard;

  gl_FragColor = vec4(pigment, alpha);
}
`;

export const OPENING_HERO_COLORS = {
  green: { r: 115 / 255, g: 191 / 255, b: 196 / 255 },
  blue: { r: 141 / 255, g: 160 / 255, b: 206 / 255 },
  amber: { r: 255 / 255, g: 129 / 255, b: 10 / 255 },
};
