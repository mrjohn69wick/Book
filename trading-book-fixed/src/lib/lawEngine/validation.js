export const validateLawRenderable = ({ law, renderedMarkers = 0, renderedLines = 0, fallbackVisible = false }) => {
  const hasRecipe = Boolean(law?.chartRecipe);
  const hasOutput = renderedLines > 0 || fallbackVisible || renderedMarkers > 0;
  const hasNonMarkerVisual = renderedLines > 0 || fallbackVisible;
  return {
    id: law?.id,
    hasRecipe,
    hasOutput,
    hasNonMarkerVisual,
    status: hasOutput ? 'pass' : 'fail',
  };
};
