// Wyrdstone income table per PRD-006 §4.5

const WYRDSTONE_TABLE: Record<number, number> = {
  1: 45,
  2: 70,
  3: 100,
  4: 120,
  5: 145,
}

export function calcWyrdstoneIncome(shards: number): number {
  if (shards <= 0) return 0
  if (shards <= 5) return WYRDSTONE_TABLE[shards]
  // 6+: 145 + 20 per additional shard beyond 5
  return 145 + (shards - 5) * 20
}
