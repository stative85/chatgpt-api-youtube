// clouds.wgsl
// WebGPU stub mirroring the GLSL implementation. Integrate into your pipeline by
// binding the uniforms buffer with time, density, gamma, resolution, and step count.

struct Uniforms {
    resolution : vec2<f32>,
    time : f32,
    density : f32,
    gamma : f32,
    steps : u32,
};

@group(0) @binding(0)
var<uniform> uniforms : Uniforms;

struct VertexOutput {
    @builtin(position) clip_position : vec4<f32>,
    @location(0) uv : vec2<f32>,
};

@vertex
fn vs_main(@location(0) position : vec2<f32>) -> VertexOutput {
    var out : VertexOutput;
    out.clip_position = vec4<f32>(position, 0.0, 1.0);
    out.uv = position * 0.5 + vec2<f32>(0.5);
    return out;
}

fn hash(p : vec3<f32>) -> f32 {
    return fract(sin(dot(p, vec3<f32>(12.9898, 78.233, 45.164))) * 43758.5453);
}

fn noise(p : vec3<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);

    let n000 = hash(i + vec3<f32>(0.0, 0.0, 0.0));
    let n001 = hash(i + vec3<f32>(0.0, 0.0, 1.0));
    let n010 = hash(i + vec3<f32>(0.0, 1.0, 0.0));
    let n011 = hash(i + vec3<f32>(0.0, 1.0, 1.0));
    let n100 = hash(i + vec3<f32>(1.0, 0.0, 0.0));
    let n101 = hash(i + vec3<f32>(1.0, 0.0, 1.0));
    let n110 = hash(i + vec3<f32>(1.0, 1.0, 0.0));
    let n111 = hash(i + vec3<f32>(1.0, 1.0, 1.0));

    let n00 = mix(n000, n100, u.x);
    let n01 = mix(n001, n101, u.x);
    let n10 = mix(n010, n110, u.x);
    let n11 = mix(n011, n111, u.x);

    let n0 = mix(n00, n10, u.y);
    let n1 = mix(n01, n11, u.y);

    return mix(n0, n1, u.z);
}

fn fbm(p : vec3<f32>) -> f32 {
    var amplitude = 0.55;
    var frequency = 1.2;
    var sum = 0.0;
    for (var i = 0; i < 5; i = i + 1) {
        sum = sum + amplitude * noise(p * frequency);
        frequency = frequency * 2.17;
        amplitude = amplitude * 0.47;
    }
    return sum;
}

struct FragmentOutput {
    @location(0) color : vec4<f32>,
};

@fragment
fn fs_main(in : VertexOutput) -> FragmentOutput {
    var out : FragmentOutput;
    var uv = in.uv * 2.0 - vec2<f32>(1.0);
    uv.x = uv.x * (uniforms.resolution.x / uniforms.resolution.y);

    let ro = vec3<f32>(0.0, 0.1, 3.0);
    var rd = normalize(vec3<f32>(uv, -1.35));

    var optical_depth = 0.0;
    var scattered = 0.0;
    var decoherence = 1.0;
    let step_length = 2.8 / f32(uniforms.steps);
    let light_dir = normalize(vec3<f32>(0.6, 0.4, -0.3));

    for (var i = 0u; i < uniforms.steps; i = i + 1u) {
        let t = f32(i) * step_length;
        let pos = ro + rd * t;
        if (abs(pos.y) > 1.4) { break; }

        let field = fbm(pos * 1.35 + vec3<f32>(0.0, uniforms.time * 0.012, 0.1 * uniforms.time));
        let cloud = smoothstep(0.32, 0.78, field);
        let sample = cloud * uniforms.density * decoherence;
        optical_depth = optical_depth + sample * step_length;

        let phase = exp(-uniforms.gamma * t);
        decoherence = mix(decoherence, phase, 0.55);

        let normal = normalize(vec3<f32>(
            fbm(pos + vec3<f32>(0.2, 0.0, 0.0)) - fbm(pos - vec3<f32>(0.2, 0.0, 0.0)),
            fbm(pos + vec3<f32>(0.0, 0.2, 0.0)) - fbm(pos - vec3<f32>(0.0, 0.2, 0.0)),
            fbm(pos + vec3<f32>(0.0, 0.0, 0.2)) - fbm(pos - vec3<f32>(0.0, 0.0, 0.2))
        ));
        let light = max(dot(normal, light_dir), 0.0) + 0.2;
        scattered = scattered + light * sample * step_length;

        if (optical_depth > 2.2) { break; }
    }

    let depth = clamp(optical_depth, 0.0, 3.0);
    let fade = 1.0 - exp(-depth * 1.1);
    var color = mix(vec3<f32>(0.05, 0.1, 0.18), vec3<f32>(0.7, 0.8, 0.95), fade);
    color = color + pow(clamp(scattered * 0.85, 0.0, 1.0), 1.3) * vec3<f32>(0.25, 0.38, 0.9);
    color = color * mix(0.92, 1.08, clamp(decoherence, 0.4, 1.0));

    out.color = vec4<f32>(color, 1.0);
    return out;
}
