export interface DecisionRecommendation {
  recommendation: string;
}

/**
 * Small utility that stores AI responses and converts them into
 * user-facing recommendation messages.
 */
export class DecisionEngine {
  private aiResponses: string[] = [];

  addResponse(response: string): void {
    this.aiResponses.push(response);
  }

  getRecommendations(): DecisionRecommendation[] {
    return this.aiResponses.map((response) => ({
      recommendation: `Based on your input: ${response}, here are some recommendations.`,
    }));
  }
}
