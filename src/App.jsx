import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { event, sections, sectionById, stages } from './workshopData.js';
import WorkshopVisual from './Visuals.jsx';
import { useWorkshopAccess } from './useWorkshopAccess.js';
import { LoginDialog, AdminDialog, QrView, LockedView, ConnectionView } from './PresenterUI.jsx';
import PixelCameo from './PixelCameo.jsx';
import { motion } from 'motion/react';
import { Cpu, Layers, SlidersHorizontal, MemoryStick, ListFilter, Server, Timer, Gauge, Network, Workflow, Calculator, LockKeyhole, KeyRound, QrCode, Settings2 } from 'lucide-react';
const sectionIcons = [Cpu, Layers, SlidersHorizontal, MemoryStick, ListFilter, Server, Timer, Gauge, Network, Workflow, Calculator];

const WORLD={width:1600,height:450};
const positions=[[175,102],[460,102],[735,102],[1010,102],[1315,102],[1290,245],[805,245],[430,245],[430,382],[805,382],[1290,382]];
function Icon({name,size=20}) {
  const paths={map:<><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/></>,plus:<path d="M12 5v14M5 12h14"/>,minus:<path d="M5 12h14"/>,fit:<><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4M21 16v4a1 1 0 0 1-1 1h-4"/></>,arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,back:<path d="M19 12H5m6-6-6 6 6 6"/>,screen:<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>,check:<path d="m4 12 5 5L20 6"/>};
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function routeFromHash(){const match=window.location.hash.match(/^#\/seccion\/(\d{1,2})$/);const id=match?.[1]?.padStart(2,'0');return id&&sectionById[id]?id:null;}
function useReducedMotion(){const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);return reduced;}
function Progress({current,completed}){const position=current?Number(current):completed.length;return <div className="progress" aria-label={current?`Sección ${position} de 11`:`${position} de 11 secciones visitadas`}><div className="progress-track" role="progressbar" aria-label={current?'Posición en el taller':'Secciones visitadas'} aria-valuemin={0} aria-valuemax={11} aria-valuenow={position}><span style={{width:`${position/11*100}%`}}/></div><span>{current?`${position} / 11`:`${position} / 11 visitadas`}</span></div>;}

function MapView({onOpen,completed,current,reduced,unlocked,presenter,accessStatus,onRetry}){
  const viewport=useRef(null),pointers=useRef(new Map()),gesture=useRef(null),interacted=useRef(false);
  const [view,setView]=useState({x:0,y:0,scale:.7}),[selected,setSelected]=useState(Math.max(0,sections.findIndex(s=>s.id===current))),[mobileVisual,setMobileVisual]=useState(false);
  const fit=useCallback(()=>{const el=viewport.current;if(!el)return;const {width,height}=el.getBoundingClientRect();const scale=Math.min((width-58)/WORLD.width,(height-24)/WORLD.height,1.15);setView({scale,x:(width-WORLD.width*scale)/2,y:(height-WORLD.height*scale)/2});interacted.current=false;},[]);
  useLayoutEffect(()=>{fit();const observer=new ResizeObserver(fit);if(viewport.current)observer.observe(viewport.current);return()=>observer.disconnect();},[fit]);
  const zoomAt=useCallback((factor,cx,cy)=>{interacted.current=true;setView(old=>{const scale=Math.max(.38,Math.min(2.2,old.scale*factor)),ratio=scale/old.scale;return{scale,x:cx-(cx-old.x)*ratio,y:cy-(cy-old.y)*ratio};});},[]);
  const zoomCenter=factor=>{const rect=viewport.current?.getBoundingClientRect();if(rect)zoomAt(factor,rect.width/2,rect.height/2);};
  const available=index=>presenter||unlocked.includes(index+1);
  const openNode=index=>{if(!available(index))return;setSelected(index);const el=viewport.current,[px,py]=positions[index];if(el&&!reduced){const {width,height}=el.getBoundingClientRect(),scale=Math.max(1.25,Math.min(1.7,width/950));setView({scale,x:width/2-px*scale,y:height/2-py*scale});window.setTimeout(()=>onOpen(sections[index].id),270);}else onOpen(sections[index].id);};
  const onPointerDown=e=>{if(e.target.closest('button'))return;e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===2){const[a,b]=[...pointers.current.values()];gesture.current={distance:Math.hypot(a.x-b.x,a.y-b.y),view};}};
  const onPointerMove=e=>{const old=pointers.current.get(e.pointerId);if(!old)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});interacted.current=true;if(pointers.current.size===1)setView(v=>({...v,x:v.x+e.clientX-old.x,y:v.y+e.clientY-old.y}));else if(pointers.current.size===2){const[a,b]=[...pointers.current.values()],distance=Math.hypot(a.x-b.x,a.y-b.y),start=gesture.current;if(!start)return;const rect=viewport.current.getBoundingClientRect(),cx=(a.x+b.x)/2-rect.left,cy=(a.y+b.y)/2-rect.top,scale=Math.max(.38,Math.min(2.2,start.view.scale*distance/start.distance)),ratio=scale/start.view.scale;setView({scale,x:cx-(cx-start.view.x)*ratio,y:cy-(cy-start.view.y)*ratio});}};
  const onPointerUp=e=>{pointers.current.delete(e.pointerId);if(pointers.current.size<2)gesture.current=null;};
  useEffect(()=>{const el=viewport.current;if(!el)return;const onWheel=e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const rect=el.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.001),e.clientX-rect.left,e.clientY-rect.top);};el.addEventListener('wheel',onWheel,{passive:false});return()=>el.removeEventListener('wheel',onWheel);},[zoomAt]);
  const onMapKey=e=>{if(e.target!==viewport.current)return;if(['ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();setSelected(i=>Math.min(10,i+1));}if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();setSelected(i=>Math.max(0,i-1));}if(e.key==='Enter'){e.preventDefault();openNode(selected);}if(e.key==='+'||e.key==='='){e.preventDefault();zoomCenter(1.2);}if(e.key==='-'){e.preventDefault();zoomCenter(1/1.2);}if(e.key==='0'||e.key==='Home'){e.preventDefault();fit();}};
  return <main className="map-page"><div className="map-intro"><div><p className="eyebrow">{event.name} <span>/</span> {event.subtitle}</p><h1><span>Inferencia de LLMs</span><em> en local.</em></h1><div className="map-intro-actions"><button className="hero-start" disabled={!available(0)} onClick={()=>onOpen('01')}><span className="hero-start-long">{available(0)?'Empezar el taller':'Esperando al taller'}</span><span className="hero-start-short">{available(0)?'Empezar':'Esperando'}</span><Icon name="arrow" size={20}/></button></div></div><div className="map-intro-side"><strong>Eduardo Zapatero<br/>Álvaro García Pizarro <small>@lvrpiz</small></strong></div></div>
    <div className={'map-area '+(mobileVisual?'show-mobile-visual':'')}><div className="map-viewport" ref={viewport} tabIndex={0} role="group" aria-label="Mapa del taller. Flechas para elegir, Intro para abrir, más y menos para zoom, cero para ajustar." onKeyDown={onMapKey} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}><div className="map-world" style={{width:WORLD.width,height:WORLD.height,transform:`translate(${view.x}px, ${view.y}px) scale(${view.scale})`,transition:reduced||interacted.current?'none':'transform 270ms cubic-bezier(.2,.8,.2,1)'}}><div className="stage-band fundamentals"><span>01 / FUNDAMENTOS</span></div><div className="stage-band serving"><span>02 / SERVICIO</span></div><div className="stage-band production"><span>03 / PRODUCCIÓN</span></div><svg className="map-links" width="1600" height="450" viewBox="0 0 1600 450" aria-hidden="true"><path d="M175 102 H1315 C1490 102 1480 245 1290 245 H430 C345 245 345 382 430 382 H1290"/></svg>{sections.map((section,index)=>{const[x,y]=positions[index],SectionIcon=sectionIcons[index],open=available(index);return <button key={section.id} type="button" className={'map-node '+(current===section.id?'current ':'')+(selected===index?'selected ':'')+(completed.includes(section.id)?'done':'')+(open?'':'locked')} style={{left:x,top:y}} disabled={!open} onClick={()=>openNode(index)} aria-label={`Sección ${Number(section.id)}: ${section.title}${!open?', bloqueada':completed.includes(section.id)?', visitada':''}`}><span className="node-number">{section.id}</span><span className="node-label">{section.short}</span><span className="node-status">{open?<SectionIcon size={22} strokeWidth={1.5} aria-hidden="true"/>:<LockKeyhole size={21} strokeWidth={1.6} aria-hidden="true"/>}</span></button>;})}</div></div><div className="map-tools"><button onClick={()=>zoomCenter(1.25)} aria-label="Acercar mapa" title="Acercar"><Icon name="plus"/></button><button onClick={()=>zoomCenter(.8)} aria-label="Alejar mapa" title="Alejar"><Icon name="minus"/></button><button onClick={fit} aria-label="Ajustar mapa a la pantalla" title="Ajustar"><Icon name="fit"/></button></div><div className="map-hint">{presenter||unlocked.length?"Selecciona una parada · Arrastra para mover el mapa":"Las lecciones se abrirán durante el taller"}</div>{accessStatus!=="ready"&&<div className="map-status" role="status">{accessStatus==="loading"?"Consultando las lecciones…":<>No se puede consultar el avance. <button onClick={()=>onRetry().catch(()=>{})}>Reintentar</button></>}</div>}<div className="mobile-map-toggle"><button onClick={()=>setMobileVisual(v=>!v)}>{mobileVisual?'Ver lista':'Ver mapa visual'}</button></div><div className="mobile-map-list"><SectionList onOpen={onOpen} completed={completed} unlocked={unlocked} presenter={presenter}/></div><details className="map-index"><summary>Lista de secciones <span>↗</span></summary><SectionList onOpen={onOpen} completed={completed} unlocked={unlocked} presenter={presenter}/></details><PixelCameo reduced={reduced}/></div>
  </main>;
}
function SectionList({onOpen,completed,unlocked,presenter}){return <ol className="section-list">{stages.map(stage=><li key={stage.id}><h3>{stage.name}</h3><ol>{sections.filter(s=>s.stage===stage.id).map(s=>{const open=presenter||unlocked.includes(Number(s.id));return <li key={s.id}><button disabled={!open} onClick={()=>onOpen(s.id)} aria-label={`${s.title}${open?'':', bloqueada'}`}><span>{s.id}</span>{s.title}{open?completed.includes(s.id)&&<Icon name="check" size={16}/>:<LockKeyhole size={16} aria-hidden="true"/>}</button></li>;})}</ol></li>)}</ol>;}

// Fit the complete diagram on a projector; retain ordinary scrolling on phones.
function DiagramFrame({ presentation, notebook, children }) {
  const frame = useRef(null), content = useRef(null);
  const [fit, setFit] = useState({ scale: 1, height: undefined });
  useLayoutEffect(() => {
    const page = frame.current.closest('.section-page');
    const update = () => {
      if (!frame.current || !content.current) return;
      if (!presentation || window.innerWidth <= 760) { setFit({ scale: 1, height: undefined }); return; }
      const top = frame.current.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop;
      const height = content.current.offsetHeight;
      const available = page.clientHeight - top - (notebook ? 48 : 18);
      const scale = Math.min(1, Math.max(.5, available / height));
      setFit(old => Math.abs(old.scale - scale) < .001 && old.height === height * scale ? old : { scale, height: height * scale });
    };
    const observer = new ResizeObserver(update);
    observer.observe(page); observer.observe(content.current);
    update();
    return () => observer.disconnect();
  }, [presentation, notebook]);
  return <div className="diagram-moment" ref={frame} style={{ height: fit.height }}><div ref={content} className="diagram-fit" style={{ transform: `scale(${fit.scale})` }}>{children}</div></div>;
}

function SectionView({section,presentation,onNext,onMap,canNext}){
  const index=sections.findIndex(s=>s.id===section.id),stage=stages.find(s=>s.id===section.stage),scrollRef=useRef(null);
  useEffect(()=>{scrollRef.current?.scrollTo({top:0,behavior:'instant'});},[section.id]);
  return <main className={'section-page '+(presentation?'is-presenting':'')} ref={scrollRef}><div className="section-inner"><div className="opening-moment"><div className="section-overline"><span>{stage.name}</span><span>{section.id} / 11</span></div><div className="section-hero"><div><h1>{section.title}</h1><p className="section-lead">{section.lead}</p></div></div><div className="hero-idea"><strong>{section.idea}</strong></div></div><DiagramFrame presentation={presentation} notebook={section.notebook}><WorkshopVisual key={`${section.id}-${presentation}`} type={section.visual}/></DiagramFrame>{presentation&&section.notebook&&<div className="presentation-notebook">{section.notebook}</div>}
    <section className="story-section" aria-label="Explicación"><div className="story-heading"><h2>{section.storyHeading}</h2></div><div className="story-list">{section.story.map((block,i)=><article className="story-block" key={i}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{block.title}</h3><p>{block.text}</p></div></article>)}</div></section>
    {section.decisions&&<section className="final-decisions"><div><h2>Decidid en grupo</h2></div><ol>{section.decisions.map((item,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{item}</li>)}</ol></section>}
    {section.notebook&&<div className="notebook-cue"><div><strong>{section.notebook}</strong>{section.footnote&&<p>{section.footnote}</p>}</div><Icon name="arrow" size={30}/></div>}
    <div className="section-bottom"><button onClick={onMap}>Volver al mapa</button>{index<10&&<button className="next-bottom" disabled={!canNext} onClick={onNext}>Siguiente sección <Icon name="arrow" size={18}/></button>}</div>
  </div></main>;
}

export default function App() {
  const access = useWorkshopAccess();
  const [sectionId, setSectionId] = useState(routeFromHash);
  const [qrMode, setQrMode] = useState(() => window.location.hash === '#/qr');
  const [presentation, setPresentation] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gdg-completed') || '[]'); }
    catch { return []; }
  });
  const returnFromQr = useRef(null);
  const reduced = useReducedMotion();
  const presenter = access.status === 'ready' && access.presenter;
  const section = sectionId ? sectionById[sectionId] : null;
  const isAvailable = useCallback(id => presenter || (access.status === 'ready' && access.unlocked.includes(Number(id))), [presenter, access.status, access.unlocked]);

  useEffect(() => {
    const update = () => {
      const route = routeFromHash();
      setSectionId(route);
      setQrMode(window.location.hash === '#/qr');
      if (!route) setPresentation(false);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => { sessionStorage.setItem('gdg-completed', JSON.stringify(completed)); }, [completed]);
  useEffect(() => {
    if (sectionId && isAvailable(sectionId)) setCompleted(old => old.includes(sectionId) ? old : [...old, sectionId]);
  }, [sectionId, isAvailable]);
  useEffect(() => {
    if (!presenter || !sectionId) return;
    access.setLesson(Number(sectionId), true).catch(() => setNotice('No se ha podido abrir esta lección para el público. Prueba de nuevo desde Lecciones.'));
  }, [sectionId, presenter, access.setLesson]);

  const openSection = id => {
    if (!isAvailable(id)) return;
    setQrMode(false);
    setSectionId(id);
    if (presenter) setPresentation(true);
    window.location.hash = '/seccion/' + id;
  };
  const showMap = () => {
    setPresentation(false);
    setQrMode(false);
    setSectionId(null);
    window.location.hash = '/mapa';
  };
  const showQr = () => {
    if (!presenter) return;
    returnFromQr.current = sectionId;
    setQrMode(true);
    setSectionId(null);
    setPresentation(false);
    window.location.hash = '/qr';
  };
  const backFromQr = () => {
    const target = returnFromQr.current;
    returnFromQr.current = null;
    if (target && isAvailable(target)) openSection(target);
    else showMap();
  };
  const move = delta => {
    if (!sectionId) return;
    const index = sections.findIndex(item => item.id === sectionId);
    const target = sections[index + delta];
    if (target && isAvailable(target.id)) openSection(target.id);
  };
  const enter = async password => {
    await access.login(password);
    if (sectionId) setPresentation(true);
  };
  const leave = () => {
    access.logout();
    showMap();
  };
  useEffect(() => {
    const onKey = event => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape' && presentation) { showMap(); return; }
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, summary, [contenteditable="true"], .workshop-support button')) return;
      if (presentation && sectionId) {
        if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); move(-1); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const index = section ? sections.findIndex(item => item.id === section.id) : -1;
  const canPrevious = index > 0 && isAvailable(sections[index - 1].id);
  const canNext = index >= 0 && index < sections.length - 1 && isAvailable(sections[index + 1].id);
  const readableSection = section && isAvailable(section.id);
  const visibleCompleted = presenter ? completed : completed.filter(id => access.unlocked.includes(Number(id)));

  let content;
  if (access.status !== 'ready') content = <ConnectionView status={access.status} error={access.error} onRetry={access.refresh}/>;
  else if (qrMode && presenter) content = <QrView onBack={backFromQr}/>;
  else if (section && !readableSection) content = <LockedView section={section} onMap={showMap}/>;
  else if (section) content = <SectionView section={section} presentation={presentation} onNext={() => move(1)} onMap={showMap} canNext={canNext}/>;
  else content = <MapView onOpen={openSection} completed={visibleCompleted} current={visibleCompleted.at(-1)} reduced={reduced} unlocked={access.unlocked} presenter={presenter} accessStatus={access.status} onRetry={access.refresh}/>;

  return <div className={'app ' + (presentation ? 'presentation' : '')}>
    <header className="site-header">
      <button className="brand" onClick={showMap} aria-label="Ir al mapa del taller"><img className="brand-mark" src="/gdg-icon.svg" alt=""/><span className="brand-desktop">VallaTech Summit <b>/</b> Inferencia local</span><span className="brand-mobile">Inferencia local</span></button>
      <div className="header-actions">
        {presentation && section && <button className="explanation-trigger" onClick={() => setPresentation(false)}>Explicación</button>}
        {section && <button className="header-map" onClick={showMap}><Icon name="map" size={18}/> <span>Mapa</span></button>}
        {presenter && <button className="presenter-header-action" onClick={showQr} aria-label="Proyectar código QR"><QrCode size={18}/><span>QR</span></button>}
        {presenter && <button className="presenter-header-action" onClick={() => setAdminOpen(true)} aria-label="Gestionar lecciones"><Settings2 size={18}/><span>Lecciones</span></button>}
        {presenter ? <button className="presentation-trigger" aria-label={presentation ? 'Salir de presentación y volver al mapa' : 'Entrar en modo presentación'} onClick={() => { if (presentation) { showMap(); return; } if (!sectionId) openSection('01'); setPresentation(true); }}><Icon name="screen" size={18}/><span>{presentation ? 'Salir al mapa' : 'Presentar'}</span></button>
          : <button className="presenter-entry" onClick={() => setLoginOpen(true)} aria-label="Acceso de ponentes" title="Ponentes"><KeyRound size={17} strokeWidth={1.6}/></button>}
      </div>
    </header>
    <motion.div className="workspace" key={qrMode ? 'qr' : section?.id || 'mapa'} initial={{ opacity: 0, y: reduced ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .16, ease: [.22, 1, .36, 1] }}>{content}</motion.div>
    {readableSection && !qrMode && <nav className="presentation-nav" aria-label="Navegación de secciones"><button onClick={() => move(-1)} disabled={!canPrevious}><Icon name="back" size={18}/><span>Anterior</span></button><Progress current={section.id} completed={completed}/><button onClick={() => move(1)} disabled={!canNext}><span>Siguiente</span><Icon name="arrow" size={18}/></button></nav>}
    {!section && !qrMode && access.status === 'ready' && <div className="overview-footer"><a className="event-link" href={event.url} target="_blank" rel="noreferrer" aria-label={event.date + ' · ' + event.place}><span className="event-full">{event.date} · {event.place}</span><span className="event-mobile">13 nov 2026 · Escuela de Ingeniería Informática<br/>Universidad de Valladolid</span><span aria-hidden="true"> ↗</span></a><Progress current={null} completed={visibleCompleted}/></div>}
    {notice && <div className="workshop-notice" role="alert">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}
    {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onLogin={enter}/>}
    {adminOpen && presenter && <AdminDialog onClose={() => setAdminOpen(false)} unlocked={access.unlocked} onSetLesson={access.setLesson} onLogout={leave}/>}
  </div>;
}
