import React, { useEffect, useState } from 'react';

const sprites = [
  { name: 'Álvaro', image: '/presenters/alvaro.png' },
  // Cuando exista la ilustración de Eduardo, optimizarla y añadirla aquí.
];

export default function PixelCameo({ reduced }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let timeout;
    const visit = () => {
      setVisible(true);
      timeout = window.setTimeout(() => {
        setVisible(false);
        timeout = window.setTimeout(visit, 55000 + Math.random() * 20000);
      }, 5200);
    };
    timeout = window.setTimeout(visit, 4500);
    return () => window.clearTimeout(timeout);
  }, [reduced]);

  if (!visible || reduced) return null;
  return <div className={`pixel-cameo ${sprites.length > 1 ? 'pixel-cameo-duo' : ''}`} aria-hidden="true">
    {sprites.map(sprite => <img key={sprite.name} src={sprite.image} alt="" width="178" height="384" draggable="false" />)}
    {sprites.length > 1 && <span className="pixel-cameo-spark">✦</span>}
  </div>;
}
