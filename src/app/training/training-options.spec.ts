import { buildWeek } from './training-options';

describe('buildWeek', () => {
  it('spreads sessions over the week with rest days between', () => {
    const week = buildWeek(['Push', 'Pull', 'Legs'], 3);
    expect(week.map((d) => d.title)).toEqual([
      'Push', 'Rest & recovery', 'Pull', 'Rest & recovery', 'Legs', 'Rest & recovery', 'Rest & recovery',
    ]);
  });

  it('cycles the split when more days are chosen than sessions', () => {
    const titles = buildWeek(['Push', 'Pull', 'Legs'], 6).filter((d) => !d.rest).map((d) => d.title);
    expect(titles).toEqual(['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']);
  });

  it('always leaves at least one rest day', () => {
    expect(buildWeek(['Full body'], 6).some((d) => d.rest)).toBe(true);
  });
});
