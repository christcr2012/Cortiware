export const queue = {
  async enqueue(_queueName: string, _payload: any) { return { id: 'q_'+Math.random().toString(36).slice(2,8) }; },
  async stats() { return { pending: 0, processing: 0, completed: 0, failed: 0 }; }
};

