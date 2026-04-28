export type LotteryResult =
  | { kind: 'winner'; amount: number }
  | { kind: 'non_winner' };
