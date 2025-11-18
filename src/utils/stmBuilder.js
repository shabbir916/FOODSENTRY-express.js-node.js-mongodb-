function buildSTM(messages) {
  const recentMessages = messages.slice(-10);

  return recentMessages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));
}

module.exports = buildSTM;
