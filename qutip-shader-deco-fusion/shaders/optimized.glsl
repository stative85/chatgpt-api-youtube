// optimized.glsl
// Optimised volumetric fog shader coupling QuTiP phase damping into ray-marched density.

#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;
uniform float uDensity;
uniform float uGamma;
uniform int uSteps;

#define FAST_HASH(p) fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453)

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float n000 = FAST_HASH(i + vec3(0.0));
    float n001 = FAST_HASH(i + vec3(0.0, 0.0, 1.0));
    float n010 = FAST_HASH(i + vec3(0.0, 1.0, 0.0));
    float n011 = FAST_HASH(i + vec3(0.0, 1.0, 1.0));
    float n100 = FAST_HASH(i + vec3(1.0, 0.0, 0.0));
    float n101 = FAST_HASH(i + vec3(1.0, 0.0, 1.0));
    float n110 = FAST_HASH(i + vec3(1.0, 1.0, 0.0));
    float n111 = FAST_HASH(i + vec3(1.0));

    float n00 = mix(n000, n100, u.x);
    float n01 = mix(n001, n101, u.x);
    float n10 = mix(n010, n110, u.x);
    float n11 = mix(n011, n111, u.x);

    float n0 = mix(n00, n10, u.y);
    float n1 = mix(n01, n11, u.y);

    return mix(n0, n1, u.z);
}

float fbm(vec3 p) {
    float amplitude = 0.55;
    float frequency = 1.2;
    float sum = 0.0;
    for (int i = 0; i < 6; ++i) {
        sum += amplitude * noise(p * frequency);
        frequency *= 2.17;
        amplitude *= 0.47;
    }
    return sum;
}

vec3 computeNormal(vec3 p) {
    float e = 0.2;
    vec3 grad = vec3(
        fbm(p + vec3(e, 0.0, 0.0)) - fbm(p - vec3(e, 0.0, 0.0)),
        fbm(p + vec3(0.0, e, 0.0)) - fbm(p - vec3(0.0, e, 0.0)),
        fbm(p + vec3(0.0, 0.0, e)) - fbm(p - vec3(0.0, 0.0, e))
    );
    return normalize(grad);
}

vec4 march(vec3 ro, vec3 rd, float density, float gamma, int steps) {
    float t = 0.0;
    float stepLength = 2.8 / float(steps);
    float opticalDepth = 0.0;
    float scattered = 0.0;
    float decoherence = 1.0;

    vec3 lightDir = normalize(vec3(0.6, 0.4, -0.3));

    for (int i = 0; i < 192; ++i) {
        if (i >= steps) break;
        vec3 pos = ro + rd * t;
        if (abs(pos.y) > 1.4) break;

        float field = fbm(pos * 1.35 + vec3(0.0, uTime * 0.012, 0.1 * uTime));
        float cloud = smoothstep(0.32, 0.78, field);

        float sample = cloud * density * decoherence;
        opticalDepth += sample * stepLength;

        float phase = exp(-gamma * t);
        decoherence = mix(decoherence, phase, 0.55);

        vec3 normal = computeNormal(pos * 0.9);
        float light = max(dot(normal, lightDir), 0.0) + 0.2;
        scattered += light * sample * stepLength;

        t += stepLength;
        if (opticalDepth > 2.2) break;
    }

    return vec4(opticalDepth, scattered, decoherence, t);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    vec3 ro = vec3(0.0, 0.1, 3.0);
    vec3 rd = normalize(vec3(uv, -1.35));

    vec4 res = march(ro, rd, uDensity, uGamma, uSteps);

    float depth = clamp(res.x, 0.0, 3.0);
    float fade = 1.0 - exp(-depth * 1.1);
    vec3 baseColor = vec3(0.05, 0.1, 0.18);
    vec3 scatterColor = mix(vec3(0.2, 0.42, 0.7), vec3(0.74, 0.84, 0.95), clamp(res.y * 1.5, 0.0, 1.0));

    vec3 color = mix(baseColor, scatterColor, fade);
    color += pow(clamp(res.y * 0.85, 0.0, 1.0), 1.3) * vec3(0.25, 0.38, 0.9);
    color *= mix(0.92, 1.08, clamp(res.z, 0.4, 1.0));

    fragColor = vec4(color, 1.0);
}
