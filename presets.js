const fs = require('fs');
const path = require('path');

const PRESETS_FILE = path.join(__dirname, 'presets.json');
const MAX_PRESETS_PER_USER = 50;

function load() {
  try {
    return JSON.parse(fs.readFileSync(PRESETS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(PRESETS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function normalize(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getPresets(userId) {
  const data = load();
  return data[userId] || [];
}

function getPreset(userId, name) {
  const key = normalize(name);
  return getPresets(userId).find(p => p.name === key) || null;
}

function findCandidates(userId, text) {
  const words = normalize(text).split(' ').filter(Boolean);
  if (words.length === 0 || words.length > 4) return [];
  return getPresets(userId).filter(p => words.every(w => p.name.includes(w)));
}

function setPreset(userId, name, notation) {
  const key = normalize(name);
  if (!key) return { ok: false, reason: 'empty_name' };
  const data = load();
  if (!data[userId]) data[userId] = [];
  const existing = data[userId].find(p => p.name === key);
  const entry = {
    name: key,
    notation,
    created: existing ? existing.created : Date.now(),
    updated: Date.now(),
  };
  if (existing) {
    data[userId][data[userId].indexOf(existing)] = entry;
  } else {
    data[userId].push(entry);
  }
  if (data[userId].length > MAX_PRESETS_PER_USER) {
    data[userId] = data[userId].slice(-MAX_PRESETS_PER_USER);
  }
  save(data);
  return { ok: true, entry, replaced: Boolean(existing) };
}

function removePreset(userId, name) {
  const key = normalize(name);
  const data = load();
  if (!data[userId]) return { ok: false, reason: 'not_found' };
  const index = data[userId].findIndex(p => p.name === key);
  if (index === -1) return { ok: false, reason: 'not_found' };
  data[userId].splice(index, 1);
  if (data[userId].length === 0) delete data[userId];
  save(data);
  return { ok: true, name: key };
}

module.exports = {
  getPresets,
  getPreset,
  findCandidates,
  setPreset,
  removePreset,
  normalize,
};
