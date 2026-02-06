export const validateLawRenderable = ({ law, renderedMarkers = 0, renderedLines = 0, fallbackVisible = false }) => {
  const hasRecipe = Boolean(law?.chartRecipe);
  const hasOutput = renderedMarkers > 0 || renderedLines > 0 || fallbackVisible;
  return {
    id: law?.id,
    hasRecipe,
    hasOutput,
    status: hasOutput ? 'pass' : 'fail',
  };
};
