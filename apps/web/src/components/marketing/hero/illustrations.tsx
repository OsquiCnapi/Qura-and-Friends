"use client";

import { motion, useReducedMotion } from "motion/react";
import { pop, staggerContainer } from "@/lib/motion.js";
import {
  Atom,
  BlochSphere,
  Buddy,
  CatQura,
  Dice,
  Dot,
  DotsGrid,
  Entangle,
  Gate,
  KetBuddy,
  Nebula,
  Orbit,
  Photon,
  Qubit,
  Sparkle,
  Star,
  Wave,
} from "./doodles.js";

/**
 * Item: pop de entrada (orquestado por el contenedor) + flotación infinita
 * con duración/delay propios para que nada se mueva al unísono.
 */
function Item({
  x,
  y,
  r = 0,
  d = 5,
  delay = 0,
  children,
}: {
  x: string;
  y: string;
  r?: number;
  d?: number;
  delay?: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={pop}
      className="absolute"
      style={{ left: x, top: y, rotate: r }}
      whileHover={{ scale: 1.12 }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{
          duration: d,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Cluster({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      aria-hidden
      className="relative hidden h-[320px] select-none lg:block"
    >
      {children}
    </motion.div>
  );
}

export function HeroIllustrationLeft() {
  return (
    <Cluster>
      <Item x="1%" y="14%" r={-8} d={5.4}>
        <BlochSphere size={48} />
      </Item>
      <Item x="20%" y="3%" d={4.6} delay={0.4}>
        <Dot size={15} color="#22d3ee" />
      </Item>
      <Item x="32%" y="0%" d={5.8} delay={0.9}>
        <Qubit size={30} color="#8b5cf6" />
      </Item>
      <Item x="48%" y="6%" d={4.2} delay={0.2}>
        <Sparkle size={20} color="#f59e0b" />
      </Item>
      <Item x="63%" y="1%" d={5.1} delay={0.6}>
        <Dot size={30} color="#1e263f" />
      </Item>
      <Item x="80%" y="10%" d={4.8} delay={1.1}>
        <Atom size={32} color="#22d3ee" />
      </Item>
      <Item x="88%" y="0%" r={10} d={5.6} delay={0.3}>
        <Photon size={32} color="#38bdf8" />
      </Item>
      <Item x="84%" y="34%" r={6} d={4.4} delay={0.8}>
        <Gate size={38} label="H" />
      </Item>
      <Item x="15%" y="20%" d={6.2}>
        <CatQura size={150} />
      </Item>
      <Item x="68%" y="50%" d={4.9} delay={0.5}>
        <Qubit size={22} color="#f59e0b" />
      </Item>
      <Item x="58%" y="64%" r={12} d={5.3} delay={1.3}>
        <Dice size={44} />
      </Item>
      <Item x="78%" y="72%" r={-10} d={4.5} delay={0.7}>
        <Star size={26} color="#f59e0b" />
      </Item>
      <Item x="90%" y="56%" d={5.7} delay={1.0}>
        <Wave size={46} color="#f59e0b" />
      </Item>
      <Item x="2%" y="66%" d={5.0} delay={0.4}>
        <Nebula size={48} color="#8b5cf6" />
      </Item>
      <Item x="36%" y="84%" d={4.3} delay={1.2}>
        <Dot size={17} color="#ef4444" />
      </Item>
      <Item x="52%" y="90%" d={5.2} delay={0.1}>
        <Dot size={10} color="#38bdf8" />
      </Item>
    </Cluster>
  );
}

export function HeroIllustrationRight() {
  return (
    <Cluster>
      <Item x="4%" y="5%" r={-16} d={5.1}>
        <Photon size={32} color="#fb7185" flip />
      </Item>
      <Item x="24%" y="0%" d={4.7} delay={0.5}>
        <DotsGrid size={34} />
      </Item>
      <Item x="42%" y="4%" d={5.5} delay={0.9}>
        <Sparkle size={22} color="#38bdf8" />
      </Item>
      <Item x="60%" y="0%" d={4.4} delay={0.3}>
        <Atom size={40} color="#22d3ee" />
      </Item>
      <Item x="80%" y="0%" d={5.8} delay={0.7}>
        <Qubit size={24} color="#8b5cf6" />
      </Item>
      <Item x="50%" y="20%" r={4} d={4.9} delay={1.1}>
        <Entangle size={54} />
      </Item>
      <Item x="88%" y="24%" d={5.3} delay={0.2}>
        <Orbit size={34} color="#38bdf8" />
      </Item>
      <Item x="6%" y="30%" d={5.9}>
        <Buddy size={90} color="#22d3ee" />
      </Item>
      <Item x="58%" y="36%" d={6.1} delay={0.6}>
        <KetBuddy size={100} />
      </Item>
      <Item x="36%" y="54%" d={4.6} delay={1.0}>
        <Dot size={24} color="#f59e0b" />
      </Item>
      <Item x="82%" y="56%" r={8} d={5.0} delay={0.4}>
        <BlochSphere size={38} />
      </Item>
      <Item x="18%" y="64%" d={4.8} delay={0.8}>
        <Wave size={44} color="#22d3ee" />
      </Item>
      <Item x="42%" y="66%" d={5.6} delay={0.3}>
        <Buddy size={96} color="#8b5cf6" />
      </Item>
      <Item x="2%" y="80%" r={-6} d={5.2} delay={1.2}>
        <Gate size={44} label="X" />
      </Item>
      <Item x="88%" y="80%" d={4.5} delay={0.6}>
        <Dot size={28} color="#1e263f" />
      </Item>
    </Cluster>
  );
}
