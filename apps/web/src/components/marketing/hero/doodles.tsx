/**
 * Doodles del hero de "Qura and Friends": personajes y formas cuánticas
 * estilo sticker, pensados para brillar sobre el fondo oscuro (#0b1020).
 * SVG puro — sin assets externos, escalan sin pixelar.
 *
 * Paleta = tokens del design system (packages/ui/theme.css):
 *   superposición #8b5cf6 · entrelazamiento #22d3ee · interferencia #f59e0b
 *   annealing #ef4444 · jugador-1 #38bdf8 · jugador-2 #fb7185
 */

/**
 * Redondea a 2 decimales. Server y cliente pueden serializar el mismo float
 * (p.ej. de Math.cos/sin) con distinta cantidad de dígitos, lo que dispara
 * un hydration mismatch en atributos SVG. Fijar la precisión lo evita.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Halo reutilizable para dar sensación de emisión cuántica. */
function glow(color: string): React.CSSProperties {
  return { filter: `drop-shadow(0 0 6px ${color}aa)` };
}

/* ---------- personajes (Qura y sus amigos) ---------- */

/** Qura: el gato cuántico (mascota). Guiño a la carrera del gato / Schrödinger. */
export function CatQura({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} viewBox="0 0 150 140" fill="none" aria-hidden style={glow("#8b5cf6")}>
      {/* aura de superposición: dos posiciones "a la vez" */}
      <ellipse cx="75" cy="88" rx="52" ry="46" fill="#8b5cf6" opacity="0.14" />
      {/* cuerpo */}
      <path d="M42 92q-6-22 8-34 17-14 34 0 14 12 8 34z" fill="#a78bfa" />
      {/* cabeza */}
      <circle cx="75" cy="58" r="34" fill="#c4b5fd" />
      {/* orejas */}
      <path d="M48 40 44 16l22 14z" fill="#a78bfa" />
      <path d="M102 40 106 16 84 30z" fill="#a78bfa" />
      <path d="M50 36 49 22l12 8z" fill="#8b5cf6" />
      <path d="M100 36 101 22 89 30z" fill="#8b5cf6" />
      {/* ojos felices */}
      <path
        d="M62 56q5-6 11 0M77 56q5-6 11 0"
        stroke="#2b1b55"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* nariz + boca */}
      <path d="M73 62h4l-2 3z" fill="#5b21b6" />
      <path
        d="M75 65v3M75 68q-4 3-8 1M75 68q4 3 8 1"
        stroke="#5b21b6"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* bigotes */}
      <path
        d="M52 60h-14M54 66l-13 4M98 60h14M96 66l13 4"
        stroke="#c4b5fd"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* cola ondulante (función de onda) */}
      <path
        d="M120 96q18-2 14-20t-16-6"
        stroke="#a78bfa"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Buddy: amigo-blob luminoso. Color configurable por "concepto". */
export function Buddy({
  size = 88,
  color = "#22d3ee",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} viewBox="0 0 90 104" fill="none" aria-hidden style={glow(color)}>
      {/* brazo saludando */}
      <path
        d="M16 40Q5 34 8 20"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="46" cy="46" r="30" fill={color} />
      {/* ojitos + sonrisa */}
      <circle cx="38" cy="42" r="3.6" fill="#0b1020" />
      <circle cx="54" cy="42" r="3.6" fill="#0b1020" />
      <path
        d="M38 52q8 7 16 0"
        stroke="#0b1020"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* piernas */}
      <path
        d="M38 74q-1 12-6 16M54 74q1 12 6 16"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ket-Buddy: personaje con forma de estado |ψ⟩. */
export function KetBuddy({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} viewBox="0 0 100 110" fill="none" aria-hidden style={glow("#38bdf8")}>
      <path
        d="M30 20v70M30 20l40 35-40 35"
        stroke="#38bdf8"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="46" cy="46" r="3.6" fill="#38bdf8" />
      <circle cx="46" cy="64" r="3.6" fill="#38bdf8" />
      <path
        d="M44 74q6 4 12 0"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ---------- formas cuánticas ---------- */

export function Qubit({
  size = 30,
  color = "#22d3ee",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={glow(color)}>
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        opacity="0.7"
      />
      <circle cx="16" cy="16" r="6" fill={color} />
      <circle cx="16" cy="16" r="2.4" fill="#0b1020" />
    </svg>
  );
}

export function Dot({
  size = 16,
  color = "#8b5cf6",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div
      aria-hidden
      style={{ width: size, height: size, background: color, ...glow(color) }}
      className="rounded-full"
    />
  );
}

export function Sparkle({
  size = 22,
  color = "#f59e0b",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={glow(color)}>
      <path
        d="M12 2.5c.75 4.3 2.3 5.85 6.6 6.6-4.3.75-5.85 2.3-6.6 6.6-.75-4.3-2.3-5.85-6.6-6.6 4.3-.75 5.85-2.3 6.6-6.6z"
        fill={color}
      />
    </svg>
  );
}

export function Star({
  size = 24,
  color = "#f59e0b",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={glow(color)}>
      <path
        d="M12 2.4l2.6 6 6.5.5-5 4.3 1.6 6.4L12 16.2l-5.7 3.4 1.6-6.4-5-4.3 6.5-.5z"
        fill={color}
      />
    </svg>
  );
}

/** Esfera de Bloch en miniatura, con vector de estado. */
export function BlochSphere({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden style={glow("#38bdf8")}>
      <circle cx="24" cy="24" r="20" fill="#1e263f" stroke="#2b3350" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="20" ry="7" stroke="#5b6472" strokeWidth="1.4" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="#5b6472" strokeWidth="1.2" />
      {/* vector de estado */}
      <line x1="24" y1="24" x2="35" y2="12" stroke="#ff4d6d" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="35" cy="12" r="3" fill="#ff4d6d" />
    </svg>
  );
}

/** Átomo: núcleo + órbitas de electrones. */
export function Atom({ size = 42, color = "#22d3ee" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden style={glow(color)}>
      <ellipse cx="24" cy="24" rx="21" ry="8" stroke={color} strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="21" ry="8" stroke={color} strokeWidth="2" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="21" ry="8" stroke={color} strokeWidth="2" transform="rotate(120 24 24)" />
      <circle cx="24" cy="24" r="5" fill={color} />
    </svg>
  );
}

/** Compuerta cuántica (H de Hadamard) como ficha. */
export function Gate({ size = 40, label = "H" }: { size?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden style={glow("#8b5cf6")}>
      <rect x="3" y="3" width="38" height="38" rx="11" fill="#8b5cf6" />
      <rect x="3" y="3" width="38" height="38" rx="11" fill="none" stroke="#c4b5fd" strokeWidth="1.6" />
      <text
        x="22"
        y="29"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fontFamily="ui-serif, Georgia, serif"
        fill="#fff"
      >
        {label}
      </text>
    </svg>
  );
}

/** Dado del tablero por turnos. */
export function Dice({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden style={glow("#f59e0b")}>
      <rect x="4" y="4" width="36" height="36" rx="9" fill="#141a2e" stroke="#f59e0b" strokeWidth="2.4" />
      <circle cx="15" cy="15" r="3" fill="#f59e0b" />
      <circle cx="29" cy="15" r="3" fill="#f59e0b" />
      <circle cx="22" cy="22" r="3" fill="#f59e0b" />
      <circle cx="15" cy="29" r="3" fill="#f59e0b" />
      <circle cx="29" cy="29" r="3" fill="#f59e0b" />
    </svg>
  );
}

/** Onda de interferencia. */
export function Wave({ size = 48, color = "#f59e0b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} viewBox="0 0 56 24" fill="none" aria-hidden style={glow(color)}>
      <path
        d="M2 12q6-11 12 0t12 0 12 0 12 0"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Par entrelazado: dos qubits unidos por un enlace. */
export function Entangle({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} viewBox="0 0 56 30" fill="none" aria-hidden style={glow("#22d3ee")}>
      <path d="M14 15h28" stroke="#22d3ee" strokeWidth="2.4" strokeDasharray="3 3" />
      <circle cx="12" cy="15" r="9" fill="#22d3ee" />
      <circle cx="44" cy="15" r="9" fill="#fb7185" />
      <circle cx="12" cy="15" r="3" fill="#0b1020" />
      <circle cx="44" cy="15" r="3" fill="#0b1020" />
    </svg>
  );
}

/** Fotón: flecha curva luminosa. */
export function Photon({
  size = 36,
  color = "#22d3ee",
  flip = false,
}: {
  size?: number;
  color?: string;
  flip?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      style={{ ...glow(color), transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M8 32Q14 12 30 12" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      <path
        d="M24 5l8 7-9 5"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Nebulosa suave de fondo (nube estelar). */
export function Nebula({ size = 46, color = "#8b5cf6" }: { size?: number; color?: string }) {
  return (
    <svg width={size} viewBox="0 0 48 32" aria-hidden style={{ opacity: 0.5 }}>
      <g fill={color}>
        <circle cx="14" cy="20" r="10" />
        <circle cx="26" cy="14" r="12" />
        <circle cx="37" cy="21" r="9" />
        <rect x="6" y="18" width="38" height="12" rx="6" />
      </g>
    </svg>
  );
}

/** Rejilla de puntos (retículo del tablero). */
export function DotsGrid({ size = 34, color = "#2b3350" }: { size?: number; color?: string }) {
  const dots = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) dots.push({ x: 5 + c * 12, y: 5 + r * 12 });
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="3" fill={color} />
      ))}
    </svg>
  );
}

/** Órbita con electrón (para acentos pequeños). */
export function Orbit({ size = 34, color = "#38bdf8" }: { size?: number; color?: string }) {
  const a = -Math.PI / 4;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden style={glow(color)}>
      <ellipse cx="18" cy="18" rx="15" ry="7" stroke={color} strokeWidth="2" transform="rotate(-30 18 18)" />
      <circle cx="18" cy="18" r="3.4" fill={color} opacity="0.6" />
      <circle cx={round2(18 + Math.cos(a) * 15)} cy={round2(18 + Math.sin(a) * 7)} r="3" fill={color} />
    </svg>
  );
}
