import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { keys, safeGetJSON, safeSetJSON } from '../utils/storage';

const AppliedLawContext = createContext(null);

export const AppliedLawProvider = ({ children }) => {
  const storedIds = safeGetJSON(keys.appliedLaws, []);
  const initialIds = Array.isArray(storedIds) ? storedIds.filter(Boolean) : [];
  const [appliedLawIds, setAppliedLawIds] = useState(initialIds);
  const [activeLawId, setActiveLawId] = useState(
    safeGetJSON(keys.activeLaw, initialIds[0] || null)
  );
  const [hiddenLawIds, setHiddenLawIds] = useState(
    Array.isArray(safeGetJSON(keys.hiddenLaws, [])) ? safeGetJSON(keys.hiddenLaws, []) : []
  );
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialLawId, setTutorialLawId] = useState(null);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [tutorialInputs, setTutorialInputs] = useState({});
  const [tutorialStepCompleted, setTutorialStepCompleted] = useState({});
  const [tutorialError, setTutorialError] = useState('');

  const syncIds = (next) => {
    const normalized = Array.from(new Set((next || []).filter(Boolean)));
    setAppliedLawIds(normalized);
    safeSetJSON(keys.appliedLaws, normalized);
    return normalized;
  };

  const applyLaw = (lawId, mode = 'add') => {
    if (!lawId) return;
    if (mode === 'replace') {
      syncIds([lawId]);
    } else {
      syncIds([...appliedLawIds, lawId]);
    }
    setActiveLawId(lawId);
    safeSetJSON(keys.activeLaw, lawId);
  };

  const removeLaw = (lawId) => {
    const next = syncIds(appliedLawIds.filter((id) => id !== lawId));
    const nextHidden = hiddenLawIds.filter((id) => id !== lawId);
    setHiddenLawIds(nextHidden);
    safeSetJSON(keys.hiddenLaws, nextHidden);
    if (activeLawId === lawId) {
      const fallback = next[0] || null;
      setActiveLawId(fallback);
      safeSetJSON(keys.activeLaw, fallback);
    }
  };

  const toggleLaw = (lawId) => {
    if (!appliedLawIds.includes(lawId)) {
      return;
    }
    if (hiddenLawIds.includes(lawId)) {
      const next = hiddenLawIds.filter((id) => id !== lawId);
      setHiddenLawIds(next);
      safeSetJSON(keys.hiddenLaws, next);
    } else {
      const next = [...hiddenLawIds, lawId];
      setHiddenLawIds(next);
      safeSetJSON(keys.hiddenLaws, next);
    }
  };

  const clearAll = () => {
    syncIds([]);
    setHiddenLawIds([]);
    safeSetJSON(keys.hiddenLaws, []);
    setActiveLawId(null);
    safeSetJSON(keys.activeLaw, null);
    endTutorial();
  };

  const startTutorial = (lawId) => {
    setTutorialActive(true);
    setTutorialLawId(lawId);
    setTutorialStepIndex(0);
    setTutorialInputs({});
    setTutorialStepCompleted({});
    setTutorialError('');
  };

  const endTutorial = () => {
    setTutorialActive(false);
    setTutorialLawId(null);
    setTutorialStepIndex(0);
    setTutorialInputs({});
    setTutorialStepCompleted({});
    setTutorialError('');
  };

  const clearTutorialError = () => {
    setTutorialError('');
  };

  const markStepCompleted = (stepIndex) => {
    setTutorialStepCompleted((prev) => ({
      ...prev,
      [stepIndex]: true
    }));
  };

  const setTutorialInput = (key, value) => {
    setTutorialInputs((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const nextTutorialStep = () => {
    setTutorialStepIndex((prev) => prev + 1);
  };

  const previousTutorialStep = () => {
    setTutorialStepIndex((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (tutorialActive && tutorialLawId && activeLawId !== tutorialLawId) {
      endTutorial();
    }
  }, [activeLawId, tutorialActive, tutorialLawId]);

  const value = useMemo(() => ({
    appliedLawIds,
    hiddenLawIds,
    activeLawId,
    appliedLawId: activeLawId,
    setAppliedLawId: (lawId) => {
      if (!lawId) {
        clearAll();
      } else {
        applyLaw(lawId, 'replace');
      }
    },
    setActiveLaw: (lawId) => {
      setActiveLawId(lawId);
      safeSetJSON(keys.activeLaw, lawId);
    },
    applyLaw,
    removeLaw,
    toggleLaw,
    clearAll,
    tutorialActive,
    tutorialLawId,
    tutorialStepIndex,
    tutorialInputs,
    tutorialStepCompleted,
    tutorialError,
    startTutorial,
    endTutorial,
    clearTutorialError,
    setTutorialError,
    markStepCompleted,
    setTutorialInput,
    nextTutorialStep,
    previousTutorialStep
  }), [
    appliedLawIds,
    hiddenLawIds,
    activeLawId,
    tutorialActive,
    tutorialLawId,
    tutorialStepIndex,
    tutorialInputs,
    tutorialStepCompleted,
    tutorialError
  ]);

  return (
    <AppliedLawContext.Provider value={value}>
      {children}
    </AppliedLawContext.Provider>
  );
};

export const useAppliedLaw = () => {
  const context = useContext(AppliedLawContext);

  if (!context) {
    throw new Error('useAppliedLaw must be used within AppliedLawProvider');
  }

  return context;
};
