// baseline.glsl
// Simple volumetric fog shader using a naive phase-damping lookup.

#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;
uniform float uDensity;

float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 151.718))) * 43758.5453);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float n000 = hash(i + vec3(0.0, 0.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n111 = hash(i + vec3(1.0, 1.0, 1.0));

    float n00 = mix(n000, n100, u.x);
    float n01 = mix(n001, n101, u.x);
    float n10 = mix(n010, n110, u.x);
    float n11 = mix(n011, n111, u.x);

    float n0 = mix(n00, n10, u.y);
    float n1 = mix(n01, n11, u.y);

    return mix(n0, n1, u.z);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    vec3 rayOrigin = vec3(0.0, 0.0, 3.0);
    vec3 rayDir = normalize(vec3(uv, -1.5));

    float density = 0.0;
    float stepSize = 0.04;

    for (int i = 0; i < 48; ++i) {
        vec3 pos = rayOrigin + rayDir * float(i) * stepSize;
        float shape = noise(pos * 1.1 + uTime * 0.02);
        density += smoothstep(0.35, 0.75, shape) * uDensity * stepSize;
    }

    vec3 fogColor = mix(vec3(0.08, 0.12, 0.2), vec3(0.5, 0.72, 0.92), clamp(density, 0.0, 1.0));
    fragColor = vec4(fogColor, 1.0);
}
