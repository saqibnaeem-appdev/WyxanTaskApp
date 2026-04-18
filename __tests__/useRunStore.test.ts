import { useRunStore } from '../src/store/useRunStore';

describe('useRunStore', () => {
  beforeEach(() => {
    // Reset store to clean state before each test
    useRunStore.getState().resetRun();
  });

  describe('Sequence Generation', () => {
    it('generates the correct 6-step sequence: SP → CP1 → CP2 → CP1 → CP2 → EP', () => {
      const { sequence } = useRunStore.getState();
      expect(sequence).toHaveLength(6);

      // SP
      expect(sequence[0].nodeType).toBe('SP');
      expect(sequence[0].node.name).toBe('Base Office');
      expect(sequence[0].targetHitIndex).toBe(1);

      // Cycle 1: CP1 → CP2
      expect(sequence[1].nodeType).toBe('CP');
      expect(sequence[1].node.name).toBe('Front Gate');
      expect(sequence[1].targetHitIndex).toBe(1);

      expect(sequence[2].nodeType).toBe('CP');
      expect(sequence[2].node.name).toBe('Loading Bay');
      expect(sequence[2].targetHitIndex).toBe(1);

      // Cycle 2: CP1 → CP2
      expect(sequence[3].nodeType).toBe('CP');
      expect(sequence[3].node.name).toBe('Front Gate');
      expect(sequence[3].targetHitIndex).toBe(2);

      expect(sequence[4].nodeType).toBe('CP');
      expect(sequence[4].node.name).toBe('Loading Bay');
      expect(sequence[4].targetHitIndex).toBe(2);

      // EP
      expect(sequence[5].nodeType).toBe('EP');
      expect(sequence[5].node.name).toBe('Base Office');
      expect(sequence[5].targetHitIndex).toBe(1);
    });

    it('enforces non-consecutive CP hits by interleaving cycles', () => {
      const { sequence } = useRunStore.getState();
      // Verify no two adjacent entries are the same checkpoint
      for (let i = 1; i < sequence.length; i++) {
        if (sequence[i].nodeType === 'CP' && sequence[i - 1].nodeType === 'CP') {
          expect(sequence[i].node.id).not.toBe(sequence[i - 1].node.id);
        }
      }
    });
  });

  describe('State Transitions', () => {
    it('starts in IDLE state', () => {
      expect(useRunStore.getState().runState).toBe('IDLE');
    });

    it('transitions from IDLE → ACTIVE on startRun()', () => {
      useRunStore.getState().startRun();
      expect(useRunStore.getState().runState).toBe('ACTIVE');
    });

    it('advances activeSequenceIndex to 1 (past SP) when run starts', () => {
      expect(useRunStore.getState().activeSequenceIndex).toBe(0);
      useRunStore.getState().startRun();
      // After starting, we skip past SP to the first CP
      expect(useRunStore.getState().activeSequenceIndex).toBe(1);
    });

    it('does NOT start run if already ACTIVE', () => {
      useRunStore.getState().startRun();
      const indexAfterFirstStart = useRunStore.getState().activeSequenceIndex;
      useRunStore.getState().startRun(); // Attempt again
      expect(useRunStore.getState().activeSequenceIndex).toBe(indexAfterFirstStart);
    });

    it('advances checkpoint during ACTIVE state', () => {
      useRunStore.getState().startRun();
      expect(useRunStore.getState().activeSequenceIndex).toBe(1);
      useRunStore.getState().advanceCheckpoint();
      expect(useRunStore.getState().activeSequenceIndex).toBe(2);
    });

    it('does NOT advance past the last sequence item', () => {
      useRunStore.getState().startRun();
      const { sequence } = useRunStore.getState();
      // Advance to the end
      for (let i = 1; i < sequence.length - 1; i++) {
        useRunStore.getState().advanceCheckpoint();
      }
      const lastIndex = useRunStore.getState().activeSequenceIndex;
      useRunStore.getState().advanceCheckpoint(); // Try to go past
      expect(useRunStore.getState().activeSequenceIndex).toBe(lastIndex);
    });

    it('transitions to COMPLETED on endRun()', () => {
      useRunStore.getState().startRun();
      useRunStore.getState().endRun();
      expect(useRunStore.getState().runState).toBe('COMPLETED');
    });

    it('resets state back to IDLE on resetRun()', () => {
      useRunStore.getState().startRun();
      useRunStore.getState().advanceCheckpoint();
      useRunStore.getState().endRun();
      useRunStore.getState().resetRun();

      const state = useRunStore.getState();
      expect(state.runState).toBe('IDLE');
      expect(state.activeSequenceIndex).toBe(0);
      expect(state.sequence).toHaveLength(6);
    });
  });

  describe('Location Management', () => {
    it('sets current location', () => {
      const loc = { latitude: 51.5010, longitude: -0.1420 };
      useRunStore.getState().setLocation(loc);
      expect(useRunStore.getState().currentLocation).toEqual(loc);
    });

    it('toggles simulation mode', () => {
      expect(useRunStore.getState().isSimulationMode).toBe(false);
      useRunStore.getState().setSimulationMode(true);
      expect(useRunStore.getState().isSimulationMode).toBe(true);
    });
  });
});
