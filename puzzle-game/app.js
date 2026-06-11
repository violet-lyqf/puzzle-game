// 中国北方80年代农村田园生活 - 精选图片库
// 使用 picsum.photos 稳定图片服务（完全免费，无需API）
// 精选适合拼图的高质量风景、田园、农村类图片

// 精选图片ID列表（picsum.photos 农村/自然/田园风光）
const RURAL_IMAGE_IDS = [
  // 田野麦田类
  15, 16, 17, 18, 19, 20,
  // 自然风光类
  28, 29, 30, 37, 39, 40,
  // 山村田园类
  42, 43, 45, 47, 50, 51,
  // 河流湖泊类
  52, 53, 54, 55, 56, 57,
  // 森林草地类
  63, 64, 65, 75, 76, 77,
  // 日出日落类
  82, 83, 84, 85, 86, 87
];

function getRandomRetroImage() {
  const id = RURAL_IMAGE_IDS[Math.floor(Math.random() * RURAL_IMAGE_IDS.length)];
  const t = Date.now();
  return 'https://picsum.photos/id/' + id + '/600/800?t=' + t;
}

function getFallbackImage() {
  const id = RURAL_IMAGE_IDS[Math.floor(Math.random() * RURAL_IMAGE_IDS.length)];
  return 'https://picsum.photos/id/' + id + '/600/800';
}

function generateRetroImages(count) {
  const shuffled = [...RURAL_IMAGE_IDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(function(id) {
    return 'https://picsum.photos/id/' + id + '/600/800';
  });
}

tt._puzzleData = {
  totalScore: 0,
  currentLevel: 1,
  currentImage: '',
  images: generateRetroImages(8),
  getRandomRetroImage: getRandomRetroImage,
  getFallbackImage: getFallbackImage,
  generateRetroImages: generateRetroImages,
  save: function() {
    tt.setStorageSync('totalScore', tt._puzzleData.totalScore);
    tt.setStorageSync('currentLevel', tt._puzzleData.currentLevel);
  }
};

App({
  onLaunch: function() {
    const score = tt.getStorageSync('totalScore') || 0;
    const level = tt.getStorageSync('currentLevel') || 1;
    tt._puzzleData.totalScore = score;
    tt._puzzleData.currentLevel = level;
    tt._puzzleData.images = generateRetroImages(8);
  }
});
