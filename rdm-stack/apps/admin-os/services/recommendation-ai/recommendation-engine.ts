export type UserPreferences = Record<string, number>;

export class RecommendationEngine<T extends Record<string, unknown>> {
  constructor(private data: T[]) {}

  score(item: T, userPreferences: UserPreferences): number {
    let score = 0;

    Object.keys(userPreferences).forEach((preferenceKey) => {
      const weight = userPreferences[preferenceKey];
      const rawValue = item[preferenceKey];

      if (typeof rawValue === "number") {
        score += rawValue * weight;
      }
    });

    return score;
  }

  recommend(userPreferences: UserPreferences): T[] {
    return this.data
      .map((item) => ({ item, score: this.score(item, userPreferences) }))
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }
}
