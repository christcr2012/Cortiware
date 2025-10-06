export const aiService = {
  async getUsageStats(_orgId: string) {
    // Minimal placeholder: simulate generous budget
    return { dailyRemaining: 100000, used: 0, limit: 100000 };
  },
};

