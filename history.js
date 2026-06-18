const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, 'history.json');
const MAX_PER_USER = 20;

function load() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function addEntry(userId, username, notation, results, total) {
  const data = load();
  if (!data[userId]) data[userId] = [];
  data[userId].unshift({
    username,
    notation,
    results,
    total,
    timestamp: Date.now(),
  });
  if (data[userId].length > MAX_PER_USER) {
    data[userId] = data[userId].slice(0, MAX_PER_USER);
  }
  save(data);
}

function getHistory(userId, limit = 10) {
  const data = load();
  if (!data[userId]) return [];
  return data[userId].slice(0, limit);
}

module.exports = { addEntry, getHistory };
