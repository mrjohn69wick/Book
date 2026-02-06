import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppliedLawContext = createContext(null);

export const AppliedLawProvider = ({ children }) => {
  const [appliedLawId, setAppliedLawId] = useState(null);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialLawId, setTutorialLawId] = useState(null);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [tutorialInputs, setTutorialInputs] = useState({});
  const [tutorialStepCompleted, setTutorialStepCompleted] = useState({});
  const [tutorialError, setTutorialError] = useState('');

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
    if (tutorialActive && tutorialLawId && appliedLawId !== tutorialLawId) {
      endTutorial();
    }
  }, [appliedLawId, tutorialActive, tutorialLawId]);

  const value = useMemo(() => ({
    appliedLawId,
    setAppliedLawId,
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
    appliedLawId,
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
