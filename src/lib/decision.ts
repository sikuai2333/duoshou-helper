import type {
  CategoryType,
  DecisionSuggestion,
} from "@/types/domain";

interface DecisionInput {
  amount?: number;
  category?: CategoryType;
  remainingBudget: number;
  funSpent: number;
  essentialSpent: number;
  daysLeftInMonth: number;
}

export function getDecisionSuggestion({
  amount,
  category = "fun",
  remainingBudget,
  funSpent,
  essentialSpent,
  daysLeftInMonth,
}: DecisionInput): DecisionSuggestion {
  const safeRemaining = Math.max(remainingBudget, 0);
  const proposedAmount = amount ?? Math.max(66, Math.round(safeRemaining * 0.12));
  const budgetRatio = safeRemaining > 0 ? proposedAmount / safeRemaining : 1;
  const funLeads = funSpent > essentialSpent * 1.15;
  const nearMonthEnd = daysLeftInMonth <= 4;
  const reasons: string[] = [];

  if (safeRemaining <= 0) {
    reasons.push("本月剩余额度已经见底");
  }

  if (budgetRatio >= 0.22) {
    reasons.push("这笔钱会吃掉比较明显的剩余额度");
  }

  if (category === "fun" && funLeads) {
    reasons.push("娱乐消费已经明显高过生活必需");
  }

  if (nearMonthEnd) {
    reasons.push("现在已经很接近月底");
  }

  if (
    safeRemaining <= 0 ||
    budgetRatio >= 0.4 ||
    (category === "fun" && funLeads && budgetRatio >= 0.22)
  ) {
    return {
      tone: "skip",
      title: "今天先别买",
      description: "预算已经很努力了，先把这股冲动放一晚，明天再看会更清楚。",
      reasons: reasons.length > 0 ? reasons : ["这笔支出已经超出当前舒适区间"],
    };
  }

  if (
    nearMonthEnd ||
    budgetRatio >= 0.22 ||
    (category === "fun" && funLeads)
  ) {
    return {
      tone: "wait",
      title: "再等等",
      description: "把想买的东西留三天观察，等冲动退一点，再决定会更稳。",
      reasons: reasons.length > 0 ? reasons : ["现在更适合延迟决定，而不是立刻下单"],
    };
  }

  return {
    tone: "buy",
    title: "可以买",
    description: "这笔花销还在舒服区间里，买也不会让本月节奏立刻失衡。",
    reasons: [
      "这笔金额还在当前预算可承受范围内",
      category === "essential" ? "它更偏向刚需支出" : "娱乐支出目前还没压过预算节奏",
    ],
  };
}
