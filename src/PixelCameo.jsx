import React, { useEffect, useRef, useState } from 'react';

const INTRO_MS = 4000;
const ENTRANCE_MS = 5000;
const CHASE_LEFT_MS = 7000;
const CHASE_RIGHT_MS = 9000;
const LOOP_MS = INTRO_MS + ENTRANCE_MS + CHASE_LEFT_MS + CHASE_RIGHT_MS;

const lerp = (from, to, progress) => from + (to - from) * Math.min(1, Math.max(0, progress));

const characters = [
  { id: 'dario', name: 'Dario', atlas: '/presenters/dario-spritesheet.webp', columns: 8, rows: 9, kind: 'pet' },
  { id: 'mini-sama', name: 'Mini Sama', atlas: '/presenters/mini-sama-spritesheet.webp', columns: 8, rows: 9, kind: 'pet' },
  { id: 'eduardo', name: 'Eduardo', atlas: '/presenters/eduardo-run-atlas.png', columns: 4, rows: 2, kind: 'presenter' },
  { id: 'alvaro', name: 'Álvaro', atlas: '/presenters/alvaro-run-atlas.png', columns: 4, rows: 2, kind: 'presenter' },
];

function Sprite({ character, running, direction, frame, idleFrame }) {
  const { columns, rows, kind } = character;
  const presenterIndex = running ? 1 + frame % 7 : 0;
  const column = kind === 'pet' ? running ? frame : idleFrame : presenterIndex % columns;
  const row = kind === 'pet' ? running ? direction === 'left' ? 2 : 1 : 0 : Math.floor(presenterIndex / columns);
  return <span
    className={`chase-sprite chase-sprite-${character.id}${running && direction === 'left' && kind === 'presenter' ? ' is-mirrored' : ''}`}
    title={character.name}
    style={{
      backgroundImage: `url("${character.atlas}")`,
      backgroundSize: `${columns * 100}% ${rows * 100}%`,
      backgroundPosition: `${column / (columns - 1) * 100}% ${row / (rows - 1) * 100}%`,
    }}
  />;
}

export default function PixelCameo({ reduced, active = false }) {
  if (!active) return null;
  const sceneRef = useRef(null);
  const [size, setSize] = useState({ width: 0, compact: false });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const element = sceneRef.current;
    const updateSize = () => {
      setSize({ width: element.clientWidth, compact: window.innerWidth <= 760 });
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    updateSize();
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const startedAt = performance.now();
    const interval = window.setInterval(() => setElapsed((performance.now() - startedAt) % LOOP_MS), 100);
    return () => window.clearInterval(interval);
  }, [reduced]);

  if (reduced) return null;
  const { width, compact } = size;
  const groupWidth = compact ? 184 : 260;
  const gap = compact ? 32 : 62;
  const presenterCenter = (width - groupWidth) / 2;
  const petRight = width - groupWidth - (compact ? 8 : 36);
  const chaseStarts = INTRO_MS + ENTRANCE_MS;
  const chaseTurns = chaseStarts + CHASE_LEFT_MS;
  const entrance = elapsed >= INTRO_MS && elapsed < chaseStarts;
  const running = elapsed >= chaseStarts;
  const direction = elapsed < chaseTurns ? 'left' : 'right';
  const frame = Math.floor(elapsed / 100) % 8;
  const idleFrame = Math.floor(elapsed / 180) % 6;

  let presentersX = presenterCenter;
  let petsX = width + 20;
  if (entrance) petsX = lerp(width + 20, petRight, (elapsed - INTRO_MS) / 900);
  if (running && direction === 'left') {
    const progress = (elapsed - chaseStarts) / (CHASE_LEFT_MS * .7);
    presentersX = lerp(presenterCenter, -groupWidth - 25, progress);
    petsX = lerp(petRight, -groupWidth - 10, progress);
  }
  if (running && direction === 'right') {
    const progress = (elapsed - chaseTurns) / CHASE_RIGHT_MS;
    presentersX = lerp(-groupWidth - 25, width + groupWidth + gap + 30, progress);
    petsX = lerp(-groupWidth * 2 - gap - 25, width + 30, progress);
  }

  return <div className={`pixel-cameo ${running ? 'is-running' : ''} ${entrance ? 'is-entrance' : ''} ${!running ? 'is-presenter-idle' : ''}`} ref={sceneRef} aria-hidden="true">
    <div className="chase-pets" style={{ transform: `translateX(${petsX}px)`, visibility: elapsed < INTRO_MS ? 'hidden' : 'visible' }}>
      <div className="chase-sprite-pair">
        {characters.filter(character => character.kind === 'pet').map(character => <Sprite key={character.id} character={character} running={running} direction={direction} frame={frame} idleFrame={idleFrame} />)}
      </div>
      {entrance && <span className="chase-speech">Dadnos vuestro datos!!</span>}
    </div>
    <div className="chase-presenters" style={{ transform: `translateX(${presentersX}px)` }}>
      <div className="chase-sprite-pair">
        {characters.filter(character => character.kind === 'presenter').map(character => <Sprite key={character.id} character={character} running={running} direction={direction} frame={frame} idleFrame={idleFrame} />)}
      </div>
    </div>
  </div>;
}
