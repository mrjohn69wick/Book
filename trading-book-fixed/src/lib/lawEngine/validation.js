export const validateLawRenderable = ({ law, renderedMarkers = 0, renderedLines = 0, renderedBoxes = 0, fallbackVisible = false }) => {
  const hasRecipe = Boolean(law?.chartRecipe);
  const hasOutput = renderedLines > 0 || renderedBoxes > 0 || fallbackVisible || renderedMarkers > 0;
  const hasNonMarkerVisual = renderedLines >= 2 && renderedBoxes >= 1;
  return {
    id: law?.id,
    hasRecipe,
    hasOutput,
    hasNonMarkerVisual,
    status: hasNonMarkerVisual && (renderedMarkers >= 1) ? 'pass' : 'fail',
  };
};
