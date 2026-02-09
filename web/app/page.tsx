'use client';
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import Link from "next/link";

function NeonBuilding({ position, height, color }: { position: [number, number, number]; height: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const m = meshRef.current.material as THREE.MeshStandardMaterial;
      const glow = 0.4 + Math.sin(t * 1.2 + position[0]) * 0.2;
      m.emissive = new THREE.Color(color);
      m.emissiveIntensity = glow;
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color="#0a0a0f" metalness={0.6} roughness={0.2} />
    </mesh>
  );
}

function ScreenPanel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const m = meshRef.current.material as THREE.MeshStandardMaterial;
      const hue = (0.55 + Math.sin(t * 0.3) * 0.08) % 1;
      m.color.setHSL(hue, 0.8, 0.6);
      m.emissive.setHSL(hue, 0.9, 0.5);
      m.emissiveIntensity = 0.8 + Math.sin(t * 2.0) * 0.2;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={[0, Math.PI * 0.25, 0]}>
      <planeGeometry args={[1.8, 1.0]} />
      <meshStandardMaterial color="#3bc7ff" metalness={0.4} roughness={0.1} />
    </mesh>
  );
}

function City() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.current.x * 0.15, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.current.y * 0.05, 0.05);
    }
  });
  return (
    <group
      ref={group}
      onPointerMove={(e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        pointer.current = { x, y };
      }}
    >
      {[...Array(18)].map((_, i) => {
        const x = -6 + (i % 6) * 2.2;
        const z = -4 + Math.floor(i / 6) * 2.2;
        const h = 1.2 + ((i * 31) % 5) * 0.6;
        const palette = ["#5eead4", "#60a5fa", "#a78bfa", "#22d3ee"];
        const color = palette[i % palette.length];
        return <NeonBuilding key={i} position={[x, h / 2, z]} height={h} color={color} />;
      })}
      <Float speed={1} rotationIntensity={0.4} floatIntensity={0.4}>
        <ScreenPanel position={[0, 1.2, 0]} />
      </Float>
      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.5}>
        <ScreenPanel position={[3.2, 1.4, -1.2]} />
      </Float>
      <Float speed={0.8} rotationIntensity={0.4} floatIntensity={0.5}>
        <ScreenPanel position={[-3.0, 1.1, -2.4]} />
      </Float>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1.2} position={[5, 8, 5]} color="#7dd3fc" />
      <directionalLight intensity={0.6} position={[-5, 6, -4]} color="#a78bfa" />
    </group>
  );
}

export default function Home() {
  return (
    <div className="bg-gray-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500" />
            <span className="text-xl font-semibold tracking-wide">DigiOut</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/advertiser" className="px-4 py-2 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">Book Ad Space</Link>
            <Link href="/dashboard/owner" className="px-4 py-2 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">List Your Screens</Link>
          </div>
        </div>
      </header>

      <section className="relative pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(168,139,250,0.12),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative z-10">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl font-extrabold leading-tight">
              Programmatic Advertising for Digital Screens in Bengaluru
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-4 text-lg text-white/70">
              A SaaS marketplace connecting advertisers and digital screen owners with real-time booking, scheduling, and payments.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mt-8 flex gap-4">
              <Link href="/dashboard/advertiser" className="px-5 py-3 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Book Ad Space</Link>
              <Link href="/dashboard/owner" className="px-5 py-3 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 text-white">List Your Screens</Link>
            </motion.div>
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-900 border border-white/10 p-4 backdrop-blur-sm">
                <div className="text-sm text-white/70">Available Screens</div>
                <div className="mt-2 text-2xl font-semibold text-cyan-400">2,148</div>
              </div>
              <div className="rounded-xl bg-gray-900 border border-white/10 p-4 backdrop-blur-sm">
                <div className="text-sm text-white/70">Campaign Booked</div>
                <div className="mt-2 text-2xl font-semibold text-purple-400">473</div>
              </div>
              <div className="rounded-xl bg-gray-900 border border-white/10 p-4 backdrop-blur-sm">
                <div className="text-sm text-white/70">Revenue Earned</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-400">₹2.4Cr</div>
              </div>
            </div>
          </div>
          <div className="relative h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            <Canvas camera={{ position: [8, 6, 10], fov: 40 }}>
              <City />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
            </Canvas>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-3xl font-bold">
          How It Works
        </motion.h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {["Select Screens", "Book Slots", "Upload Creative", "Verify Playback"].map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 p-6">
              <div className="h-32 rounded-lg bg-[radial-gradient(circle,_rgba(34,211,238,0.12),_transparent_60%)] flex items-center justify-center">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500" />
              </div>
              <div className="mt-4 text-lg font-medium">{t}</div>
              <div className="text-sm text-white/70">Step {i + 1}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-10">
        <div className="rounded-2xl border border-white/10 p-8 bg-gray-900">
          <h3 className="text-2xl font-semibold">For Screen Owners</h3>
          <p className="mt-3 text-white/70">Automated bookings, transparent payouts, and utilization insights.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {["Upcoming Bookings", "Monthly Revenue", "Screen Utilization"].map((x, i) => (
              <div key={x} className="rounded-xl bg-gray-900 border border-white/10 p-4">
                <div className="text-sm text-white/70">{x}</div>
                <div className={`mt-2 text-xl font-semibold ${i===0?'text-cyan-400':i===1?'text-emerald-400':'text-purple-400'}`}>
                  {i === 0 ? "27" : i === 1 ? "₹6.8L" : "87%"}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-gray-900">
          <h3 className="text-2xl font-semibold">For Advertisers</h3>
          <p className="mt-3 text-white/70">Real-time scheduling, transparent delivery, and analytics.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {["Campaigns Active", "Screens Live", "Cities Ready"].map((x, i) => (
              <div key={x} className="rounded-xl bg-gray-900 border border-white/10 p-4">
                <div className="text-sm text-white/70">{x}</div>
                <div className={`mt-2 text-xl font-semibold ${i===0?'text-purple-400':i===1?'text-cyan-400':'text-blue-400'}`}>
                  {i === 0 ? "9" : i === 1 ? "143" : "Next"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h3 className="text-2xl font-semibold">Technology & Trust</h3>
        <p className="mt-3 text-white/70">Secure payments, cloud hosting, proof-of-play, analytics.</p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Secure Payments", "Cloud Hosting", "Proof-of-Play", "Analytics"].map((t, i) => (
            <div key={t} className="rounded-xl border border-white/10 bg-gray-900 p-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500" />
              <div className="text-lg">{t}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.12),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(88,28,135,0.14),_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 py-24 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Turn Every Screen into Revenue. Turn Every Campaign into Impact.</h2>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/dashboard/advertiser" className="px-6 py-3 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Get Started in Bengaluru</Link>
            <Link href="/dashboard/owner" className="px-6 py-3 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 text-white">List Your Screens</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center text-white/60">© 2026 DigiOut. All rights reserved.</div>
      </footer>
    </div>
  );
}
