Page({
  data: {
    level: 1,
    totalScore: 0,
    currentImage: '',
    pieces: [],
    boardSize: 300,
    pieceSize: 100,
    cols: 3,
    rows: 3,
    selectedId: -1,
    moves: 0,
    timeStr: '00:00',
    seconds: 0,
    showPreview: false,
    showSuccess: false,
    showNumbers: false
  },

  _timer: null,

  onLoad() {
    const pd = tt._puzzleData;
    // 根据屏幕宽度计算棋盘大小
    const sysInfo = tt.getSystemInfoSync();
    const screenWidth = sysInfo.windowWidth;
    const boardSize = Math.floor(screenWidth * 0.92);

    // 根据关卡决定难度（切片数量）
    const level = pd.currentLevel;
    let cols = 3; // 默认 3x3=9 块
    if (level >= 4 && level <= 6) cols = 4; // 4x4=16 块
    if (level >= 7) cols = 5;               // 5x5=25 块

    const pieceSize = Math.floor(boardSize / cols);
    const actualBoardSize = pieceSize * cols;

    this.setData({
      level,
      totalScore: pd.totalScore,
      boardSize: actualBoardSize,
      pieceSize,
      cols,
      rows: cols
    });

    this.loadImage();
  },

  onUnload() {
    this.stopTimer();
  },

  // ─── 加载图片并初始化拼图 ───────────────────────────────────────────────

  loadImage() {
    const pd = tt._puzzleData;
    const images = pd.images;
    const idx = (pd.currentLevel - 1) % images.length;
    const imageUrl = images[idx];
    this.setData({ currentImage: imageUrl }, () => {
      this.initPuzzle();
    });
  },

  initPuzzle() {
    const { cols, rows } = this.data;
    const total = cols * rows;

    // 生成有序切片
    let pieces = [];
    for (let i = 0; i < total; i++) {
      const correctRow = Math.floor(i / cols);
      const correctCol = i % cols;
      pieces.push({
        id: i,
        correctRow,
        correctCol,
        row: correctRow,
        col: correctCol,
        selected: false,
        correct: false
      });
    }

    // 打乱切片（保证可解）
    pieces = this.shuffleArray(pieces);

    // 重新分配行列位置
    for (let i = 0; i < total; i++) {
      pieces[i].row = Math.floor(i / cols);
      pieces[i].col = i % cols;
    }

    this.setData({
      pieces,
      selectedId: -1,
      moves: 0,
      seconds: 0,
      timeStr: '00:00',
      showSuccess: false
    });

    this.stopTimer();
    this.startTimer();
  },

  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  shufflePieces() {
    tt.showModal({
      title: '重新排列',
      content: '确定重新打乱拼图吗？步数将清零。',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) this.initPuzzle();
      }
    });
  },

  // ─── 计时器 ─────────────────────────────────────────────────────────────

  startTimer() {
    this._timer = setInterval(() => {
      const s = this.data.seconds + 1;
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      this.setData({ seconds: s, timeStr: `${mm}:${ss}` });
    }, 1000);
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  // ─── 点击切片逻辑 ────────────────────────────────────────────────────────

  onPieceTap(e) {
    if (this.data.showSuccess) return;
    const tappedId = parseInt(e.currentTarget.dataset.id);
    const { selectedId, pieces } = this.data;

    if (selectedId === -1) {
      // 第一次点击：选中
      const newPieces = pieces.map(p => ({
        ...p,
        selected: p.id === tappedId
      }));
      this.setData({ pieces: newPieces, selectedId: tappedId });
    } else if (selectedId === tappedId) {
      // 再次点击同一块：取消选中
      const newPieces = pieces.map(p => ({ ...p, selected: false }));
      this.setData({ pieces: newPieces, selectedId: -1 });
    } else {
      // 点击另一块：交换位置
      this.swapPieces(selectedId, tappedId);
    }
  },

  swapPieces(idA, idB) {
    let pieces = this.data.pieces.map(p => ({ ...p }));
    const a = pieces.find(p => p.id === idA);
    const b = pieces.find(p => p.id === idB);

    // 交换行列
    const tmpRow = a.row;
    const tmpCol = a.col;
    a.row = b.row;
    a.col = b.col;
    b.row = tmpRow;
    b.col = tmpCol;

    // 清除选中状态，检查是否到达正确位置
    pieces = pieces.map(p => ({
      ...p,
      selected: false,
      correct: p.row === p.correctRow && p.col === p.correctCol
    }));

    const moves = this.data.moves + 1;
    this.setData({ pieces, selectedId: -1, moves });

    // 检查是否全部正确
    if (pieces.every(p => p.correct)) {
      this.onPuzzleComplete();
    }
  },

  // ─── 拼图完成 ────────────────────────────────────────────────────────────

  onPuzzleComplete() {
    this.stopTimer();
    const pd = tt._puzzleData;
    // 更新积分
    const newScore = pd.totalScore + 10;
    const newLevel = pd.currentLevel + 1;
    pd.totalScore = newScore;
    pd.currentLevel = newLevel;
    pd.save();

    this.setData({
      totalScore: newScore,
      showSuccess: true
    });

    tt.vibrateShort();
  },

  // ─── 下一关 ─────────────────────────────────────────────────────────────

  nextLevel() {
    const pd = tt._puzzleData;
    const level = pd.currentLevel;
    const images = pd.images;
    const idx = (level - 1) % images.length;

    // 根据新关卡更新难度
    let cols = 3;
    if (level >= 4 && level <= 6) cols = 4;
    if (level >= 7) cols = 5;

    const pieceSize = Math.floor(this.data.boardSize / cols);
    const actualBoardSize = pieceSize * cols;

    this.setData({
      level,
      cols,
      rows: cols,
      pieceSize,
      boardSize: actualBoardSize,
      currentImage: images[idx],
      showSuccess: false
    }, () => {
      this.initPuzzle();
    });
  },

  // ─── 其他操作 ────────────────────────────────────────────────────────────

  togglePreview() {
    this.setData({ showPreview: !this.data.showPreview });
  },

  preventClose() {
    // 阻止点击弹层内容关闭弹层
  },

  toggleNumbers() {
    this.setData({ showNumbers: !this.data.showNumbers });
  },

  goBack() {
    this.stopTimer();
    tt.navigateBack();
  },

  goHome() {
    this.stopTimer();
    tt.navigateBack();
  }
});