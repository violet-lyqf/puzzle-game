// 治愈系田园农村怀旧风格图片关键词（符合8090后童年记忆）
const RETRO_KEYWORDS = [
  // 田园自然风光
  'countryside', 'farmland', 'rice-field', 'wheat-field', 'sunflower-field',
  'rural-path', 'village-road', 'dirt-road', 'old-bridge', 'stone-bridge',
  'river-village', 'mountain-village', 'misty-village', 'foggy-countryside', 'dawn-farm',

  // 农村建筑与场景
  'old-farmhouse', 'mud-house', 'tiled-roof', 'wooden-house', 'barn',
  'old-well', 'water-wheel', 'windmill', 'old-fence', 'straw-stack',
  'village-alley', 'old-courtyard', 'ancient-village', 'rural-house', 'country-gate',

  // 农耕与劳作
  'farmer-field', 'ox-plow', 'rice-harvest', 'corn-harvest', 'vegetable-garden',
  'lotus-pond', 'fishing-village', 'country-market', 'bamboo-forest', 'tea-plantation',

  // 童年记忆场景
  'country-school', 'old-classroom', 'childhood-village', 'rural-playground', 'kite-field',
  'firefly-night', 'summer-pond', 'autumn-harvest', 'spring-blossom', 'winter-snow-village',

  // 治愈系自然
  'morning-dew', 'golden-sunset-farm', 'green-hills', 'babbling-brook', 'wildflowers',
  'cherry-blossom-village', 'maple-countryside', 'lavender-field', 'misty-morning', 'rainbow-farm'
];

// 生成随机怀旧图片 URL
function getRandomRetroImage() {
  const seed = RETRO_KEYWORDS[Math.floor(Math.random() * RETRO_KEYWORDS.length)];
  const random = Math.floor(Math.random() * 9999);
  return `https://picsum.photos/seed/${seed}${random}/600/600`;
}

// 预生成不重复的怀旧图片列表
function generateRetroImages(count) {
  const images = [];
  const usedSeeds = new Set();
  while (images.length < count) {
    const seed = RETRO_KEYWORDS[Math.floor(Math.random() * RETRO_KEYWORDS.length)];
    const random = Math.floor(Math.random() * 9999);
    const key = `${seed}${random}`;
    if (!usedSeeds.has(key)) {
      usedSeeds.add(key);
      images.push(`https://picsum.photos/seed/${key}/600/600`);
    }
  }
  return images;
}

// 全局共享对象，挂载到 tt 上避免 getApp 问题
tt._puzzleData = {
  totalScore: 0,
  currentLevel: 1,
  currentImage: '',
  images: generateRetroImages(8),
  getRandomRetroImage,
  generateRetroImages,
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
    tt._puzzleData.images = generateRetroImages(8);
  }
});
