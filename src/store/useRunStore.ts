import { create } from 'zustand';
import { MOCK_ROUTE, Coordinate, RouteNode, RouteData } from '@mocks/routeData';

export type RunState = 'IDLE' | 'ACTIVE' | 'COMPLETED';

export interface SequenceNode {
  node: RouteNode;
  nodeType: 'SP' | 'CP' | 'EP';
  targetHitIndex: number;
}

interface RunStoreState {
  runState: RunState;
  currentLocation: Coordinate | null;
  sequence: SequenceNode[];
  activeSequenceIndex: number;

  isSimulationMode: boolean;

  setLocation: (loc: Coordinate) => void;
  setSimulationMode: (active: boolean) => void;
  startRun: () => void;
  advanceCheckpoint: () => void;
  endRun: () => void;
  resetRun: () => void;
}

const generateSequence = (): SequenceNode[] => {
  const seq: SequenceNode[] = [];

  seq.push({ node: MOCK_ROUTE.startPoint, nodeType: 'SP', targetHitIndex: 1 });

  const sortedCPs = [...MOCK_ROUTE.checkpoints].sort(
    (a, b) => a.order - b.order,
  );
  const maxHits = Math.max(...sortedCPs.map(cp => cp.hits));

  for (let cycle = 1; cycle <= maxHits; cycle++) {
    for (const cp of sortedCPs) {
      if (cycle <= cp.hits) {
        seq.push({ node: cp, nodeType: 'CP', targetHitIndex: cycle });
      }
    }
  }

  seq.push({ node: MOCK_ROUTE.endPoint, nodeType: 'EP', targetHitIndex: 1 });

  return seq;
};

export const useRunStore = create<RunStoreState>((set, get) => ({
  runState: 'IDLE',
  currentLocation: null,
  sequence: generateSequence(),
  activeSequenceIndex: 0,
  isSimulationMode: false,

  setLocation: (loc: Coordinate) => set({ currentLocation: loc }),

  setSimulationMode: (active: boolean) => set({ isSimulationMode: active }),

  startRun: () => {
    const { runState, activeSequenceIndex } = get();
    if (runState === 'IDLE') {
      set({ runState: 'ACTIVE', activeSequenceIndex: activeSequenceIndex + 1 });
    }
  },

  advanceCheckpoint: () => {
    const { activeSequenceIndex, sequence, runState } = get();
    if (runState === 'ACTIVE' && activeSequenceIndex < sequence.length - 1) {
      set({ activeSequenceIndex: activeSequenceIndex + 1 });
    }
  },

  endRun: () => {
    set({ runState: 'COMPLETED' });
  },

  resetRun: () => {
    set({
      runState: 'IDLE',
      activeSequenceIndex: 0,
      sequence: generateSequence(),
    });
  },
}));

export const useActiveTargetNode = () => {
  const currentSequenceIndex = useRunStore(s => s.activeSequenceIndex);
  const sequence = useRunStore(s => s.sequence);
  return sequence[currentSequenceIndex];
};
