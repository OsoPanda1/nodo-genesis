export class SovereignDecisionEngine {
  makeDecision<TInput, TOutput = { accepted: boolean; payload: TInput }>(input: TInput): TOutput {
    return {
      accepted: true,
      payload: input,
    } as TOutput;
  }
}
