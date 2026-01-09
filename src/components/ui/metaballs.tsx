"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  varying vec2 vUv;

  // Optimized smooth min
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  float sdSphere(vec3 p, vec3 c, float r) {
    return length(p - c) - r;
  }

  float scene(vec3 p) {
    float t = uTime;

    // Dynamic, lively movement patterns
    vec3 c1 = vec3(
      sin(t * 1.2) * 0.4 + cos(t * 0.7) * 0.2,
      cos(t * 0.9) * 0.3 + sin(t * 1.1) * 0.15,
      sin(t * 0.6) * 0.3
    );

    vec3 c2 = vec3(
      cos(t * 0.8) * 0.5,
      sin(t * 1.0) * 0.4 + cos(t * 0.5) * 0.2,
      cos(t * 0.7) * 0.25
    );

    vec3 c3 = vec3(
      -sin(t * 0.9) * 0.45 + cos(t * 1.3) * 0.15,
      -cos(t * 0.7) * 0.35,
      sin(t * 0.8) * 0.2
    );

    // Mouse influence
    c1.xy += (uMouse - 0.5) * 0.3;

    // Pulsing sizes
    float pulse1 = 0.32 + sin(t * 2.0) * 0.04;
    float pulse2 = 0.28 + cos(t * 1.8) * 0.03;
    float pulse3 = 0.24 + sin(t * 2.2) * 0.03;

    float d1 = sdSphere(p, c1, pulse1);
    float d2 = sdSphere(p, c2, pulse2);
    float d3 = sdSphere(p, c3, pulse3);

    float d = smin(d1, d2, 0.4);
    d = smin(d, d3, 0.4);

    return d;
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.002, 0.0);
    return normalize(vec3(
      scene(p + e.xyy) - scene(p - e.xyy),
      scene(p + e.yxy) - scene(p - e.yxy),
      scene(p + e.yyx) - scene(p - e.yyx)
    ));
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x / uResolution.y;

    // Offset to right side of screen
    uv.x -= 0.6;
    uv.y += 0.1;

    vec3 ro = vec3(0.0, 0.0, 2.2);
    vec3 rd = normalize(vec3(uv, -1.2));

    float t = 0.0;
    bool hit = false;

    // Optimized ray march - fewer steps
    for(int i = 0; i < 48; i++) {
      vec3 p = ro + rd * t;
      float d = scene(p);
      if(d < 0.003) { hit = true; break; }
      if(t > 5.0) break;
      t += d;
    }

    // Transparent background
    if(!hit) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 v = -rd;

    // Fresnel
    float fres = pow(1.0 - max(dot(v, n), 0.0), 3.0);

    // Lighting
    vec3 l1 = normalize(vec3(0.5, 0.8, 0.6));
    vec3 l2 = normalize(vec3(-0.6, 0.3, 0.7));

    float diff1 = max(dot(n, l1), 0.0);
    float diff2 = max(dot(n, l2), 0.0) * 0.4;
    float spec = pow(max(dot(reflect(-l1, n), v), 0.0), 48.0);

    // Premium dark palette with colored rim
    vec3 base = vec3(0.03, 0.03, 0.04);
    vec3 rim = vec3(0.35, 0.25, 0.5); // Purple rim
    vec3 highlight = vec3(1.0, 0.95, 0.9);

    vec3 color = base;
    color += base * (diff1 + diff2) * 1.5;
    color += rim * fres * 0.8;
    color += rim * pow(fres, 6.0) * 0.5;
    color += highlight * spec * 0.7;

    // Edge fade
    float alpha = smoothstep(0.0, 0.2, 1.0 - fres * 0.4);
    alpha *= smoothstep(4.0, 2.5, t);

    gl_FragColor = vec4(color, alpha * 0.9);
  }
`;

function MetaballScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }), [size.width, size.height]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Smooth mouse
    mouse.current.x += ((state.pointer.x + 1) / 2 - mouse.current.x) * 0.08;
    mouse.current.y += ((state.pointer.y + 1) / 2 - mouse.current.y) * 0.08;
    mat.uniforms.uMouse.value.copy(mouse.current);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}

interface MetaballsProps {
  className?: string;
}

export function Metaballs({ className }: MetaballsProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: false
        }}
        style={{ background: 'transparent' }}
      >
        <MetaballScene />
      </Canvas>
    </div>
  );
}
