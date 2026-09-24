import React from 'react';
import { FlowVisual, ArchitectureVisual, PrecisionVisual, MemoryVisual, DecisionVisual } from './diagrams/Fundamentals';
import { ServingVisual, MetricsVisual, TuningVisual } from './diagrams/Serving';
import { ProductionVisual, ParallelVisual, SizingVisual } from './diagrams/Production';
import './diagrams/diagrams.css';

const visuals = {
  flow: FlowVisual, architecture: ArchitectureVisual, precision: PrecisionVisual,
  memory: MemoryVisual, decision: DecisionVisual, serving: ServingVisual,
  metrics: MetricsVisual, tuning: TuningVisual, production: ProductionVisual,
  parallel: ParallelVisual, sizing: SizingVisual,
};
export default function WorkshopVisual({ type }) {
  const Component = visuals[type];
  return Component ? <Component/> : null;
}
