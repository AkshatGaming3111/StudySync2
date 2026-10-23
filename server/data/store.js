const fs = require('fs');
const path = require('path');
const initialData = require('./initialData');

const DB_FILE = path.join(__dirname, 'studysync_db.json');

class Store {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all required collections exist
        for (const key of Object.keys(initialData)) {
          if (!this.data[key]) {
            this.data[key] = JSON.parse(JSON.stringify(initialData[key]));
          }
        }
      } else {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting to initial clean state:', err);
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    return this.data;
  }

  get(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    const list = this.get(collection);
    return list.find(item => item.id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, id, updates) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[collection][index] = { ...this.data[collection][index], ...updates };
      this.save();
      return this.data[collection][index];
    }
    return null;
  }

  delete(collection, id) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      const removed = this.data[collection].splice(index, 1);
      this.save();
      return removed[0];
    }
    return null;
  }

  // Gamification helper: award XP, calculate level, check badges
  awardXP(userId, xpAmount, reason = '') {
    const user = this.findById('users', userId);
    if (!user) return null;

    const oldXP = user.xp || 0;
    const newXP = oldXP + xpAmount;
    const newLevel = Math.floor(newXP / 300) + 1;
    const levelUp = newLevel > (user.level || 1);

    const userBadges = new Set(user.badges || []);
    const newlyUnlockedBadges = [];

    if (newXP >= 500 && !userBadges.has('b_early_bird')) {
      userBadges.add('b_early_bird');
      newlyUnlockedBadges.push('b_early_bird');
    }
    if (newXP >= 1500 && !userBadges.has('b_streak_titan')) {
      userBadges.add('b_streak_titan');
      newlyUnlockedBadges.push('b_streak_titan');
    }
    if (newXP >= 2500 && !userBadges.has('b_top_ranker')) {
      userBadges.add('b_top_ranker');
      newlyUnlockedBadges.push('b_top_ranker');
    }

    const updatedUser = this.update('users', userId, {
      xp: newXP,
      level: newLevel,
      badges: Array.from(userBadges)
    });

    return {
      user: updatedUser,
      xpGained: xpAmount,
      reason,
      levelUp,
      newLevel,
      newlyUnlockedBadges
    };
  }
}

const store = new Store();
module.exports = store;
