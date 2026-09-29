// Local storage high score management

export interface HighScoreRecord {
  id: string;
  name: string;
  score: number;
  kills: number;
  headshots: number;
  roundsWon: number;
  date: string;
}

const STORAGE_KEY = 'cs_pixel_highscores_v1';

export function getHighScores(): HighScoreRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Default leaderboards for immersion
      return [
        { id: '1', name: 's1mple_bot', score: 3850, kills: 28, headshots: 19, roundsWon: 7, date: '2026-03-20' },
        { id: '2', name: 'ZywOo_ai', score: 3200, kills: 24, headshots: 15, roundsWon: 6, date: '2026-03-22' },
        { id: '3', name: 'NiKo_1tap', score: 2750, kills: 20, headshots: 18, roundsWon: 5, date: '2026-03-25' },
        { id: '4', name: 'm0NESY_flick', score: 2300, kills: 17, headshots: 12, roundsWon: 4, date: '2026-03-27' },
        { id: '5', name: 'dev1ce', score: 1800, kills: 14, headshots: 9, roundsWon: 3, date: '2026-03-28' },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHighScore(record: Omit<HighScoreRecord, 'id' | 'date'>): HighScoreRecord[] {
  const existing = getHighScores();
  const newEntry: HighScoreRecord = {
    ...record,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...existing, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  return updated;
}
