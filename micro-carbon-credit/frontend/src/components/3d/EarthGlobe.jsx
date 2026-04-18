import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

const OrbitingTokens = ({ isHovered }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      const speed = isHovered ? 2.0 : 0.5;
      groupRef.current.rotation.y += delta * speed;
      groupRef.current.rotation.z += delta * (speed * 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        const radius = 2.8;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, Math.sin(angle) * radius]}>
            <icosahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={0.8} flatShading={true} />
          </mesh>
        );
      })}
    </group>
  );
};

export default function EarthGlobe() {
  const globeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (globeRef.current) {
      const speed = hovered ? 0.8 : 0.2;
      globeRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer Glow Ring */}
      <Torus args={[2.6, 0.05, 16, 100]} rotation={[Math.PI / 2.5, 0, 0]}>
        <meshBasicMaterial color="#00D4AA" transparent opacity={0.3} />
      </Torus>
      
      <Torus args={[2.6, 0.1, 16, 100]} rotation={[Math.PI / 2.5, 0, 0]}>
        <meshBasicMaterial color="#00FF88" transparent opacity={0.1} />
      </Torus>

      {/* Earth Sphere */}
      <Icosahedron ref={globeRef} args={[2.2, 2]}>
        <meshStandardMaterial 
          color="#15803d" 
          emissive="#14532d"
          emissiveIntensity={0.2}
          flatShading={true}
        />
      </Icosahedron>

      {/* Orbiting Credit Tokens */}
      <OrbitingTokens isHovered={hovered} />
    </group>
  );
}
