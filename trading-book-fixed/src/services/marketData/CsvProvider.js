export const createCsvProvider = () => ({
  id: 'csv',
  supports() {
    return true;
  },
  async fetchCandles({ bars = [] }) {
    return { bars, provider: 'csv' };
  },
});
