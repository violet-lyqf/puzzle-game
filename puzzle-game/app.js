// 中国农村生活主题图片库
// 风格：真实农村生活、田园风光、农耕场景
// 要求：背景丰富、主体鲜明、颜色层次高、拼图友好

const PUZZLE_IMAGES = [
  // 田园风光
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1470076892663-af684e5e15af?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=600&h=800&fit=crop&q=90',

  // 农耕劳作
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&h=800&fit=crop&q=90',

  // 村庄建筑
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1552083375-1447ce886485?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&h=800&fit=crop&q=90',

  // 四季自然
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1465919292275-c60ba49da6ae?w=600&h=800&fit=crop&q=90',

  // 河流溪涧
  'https://images.unsplash.com/photo-1455218873509-8097305ee378?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1510784722466-f2aa240c0bbd?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=600&h=800&fit=crop&q=90',

  // 日出日落
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=800&fit=crop&q=90&sat=-20',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc8c?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&h=800&fit=crop&q=90&bright=10',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop&q=90&sat=20'
];

// 每关不重复的随机图片队列
let _shuffledQueue = [];

function _rebuildQueue() {
  // Fisher-Yates 洗牌算法生成不重复队列
  const arr = PUZZLE_IMAGES.map((_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  _shuffledQueue = arr;
}

function getRandomRetroImage() {
  if (_shuffledQueue.length === 0) _rebuildQueue();
  const idx = _shuffledQueue.pop();
  return PUZZLE_IMAGES[idx];
}

function getFallbackImage() {
  const idx = Math.floor(Math.random() * PUZZLE_IMAGES.length);
  return PUZZLE_IMAGES[idx];
}

function generateRetroImages(count) {
  if (_shuffledQueue.length === 0) _rebuildQueue();
  const result = [];
  for (let i = 0; i < count && _shuffledQueue.length > 0; i++) {
    const idx = _shuffledQueue.pop();
    result.push(PUZZLE_IMAGES[idx]);
  }
  return result;
}

// 初始化队列
_rebuildQueue();

tt._puzzleData = {
  totalScore: 0,
  currentLevel: 1,
  currentImage: '',
  images: [],
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
  }
});