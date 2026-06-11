// 全局共享对象，挂载到 tt 上避免 getApp 问题
tt._puzzleData = {
  totalScore: 0,
  currentLevel: 1,
  images: [
    'https://picsum.photos/seed/puzzle1/600/600',
    'https://picsum.photos/seed/puzzle2/600/600',
    'https://picsum.photos/seed/puzzle3/600/600',
    'https://picsum.photos/seed/puzzle4/600/600',
    'https://picsum.photos/seed/puzzle5/600/600',
    'https://picsum.photos/seed/puzzle6/600/600',
    'https://picsum.photos/seed/puzzle7/600/600',
    'https://picsum.photos/seed/puzzle8/600/600'
  ],
  save() {
    tt.setStorageSync('totalScore', tt._puzzleData.totalScore);
    tt.setStorageSync('currentLevel', tt._puzzleData.currentLevel);
  }
};

App({
  onLaunch() {
    const score = tt.getStorageSync('totalScore') || 0;
    const level = tt.getStorageSync('currentLevel') || 1;
    tt._puzzleData.totalScore = score;
    tt._puzzleData.currentLevel = level;
  }
});