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
    const sysInfo = tt.getSystemInfoSync();
    const screenWidth = sysInfo.windowWidth;
    const boardSize = Math.floor(screenWidth * 0.92);

    const level = pd.currentLevel;
    let cols = 3;
    if (level >= 4 && level <= 6) cols = 4;
    if (level >= 7) cols = 5;

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

  loadImage() {
    const pd = tt._puzzleData;
    // 每次加载关卡都随机生成一张新的怀旧图片
    const imageUrl = pd.getRandomRetroImage();
    pd.currentImage = imageUrl;
    // 预加载图片，加载成功后再初始化拼图
    tt.showLoading({ title: '图片加载中...' });
    tt.getImageInfo({
      src: imageUrl,
      success: () => {
        tt.hideLoading();
        this.setData({ currentImage: imageUrl }, () => {
          this.initPuzzle();
        });
      },
      fail: () => {
        // 加载失败则重新生成一张
        tt.hideLoading();
        const fallbackUrl = pd.getRandomRetroImage();
        pd.currentImage = fallbackUrl;
        this.setData({ currentImage: fallbackUrl }, () => {
          this.initPuzzle();
        });
      }
    });
  },

  initPuzzle() {
    const { cols, rows } = this.data;
    const total = cols * rows;

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

    pieces = this.shuffleArray(pieces);

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

  onPieceTap(e) {
    if (this.data.showSuccess) return;
    const tappedId = parseInt(e.currentTarget.dataset.id);
    const { selectedId, pieces } = this.data;

    if (selectedId === -1) {
      const newPieces = pieces.map(p => ({
        ...p,
        selected: p.id === tappedId
      }));
      this.setData({ pieces: newPieces, selectedId: tappedId });
    } else if (selectedId === tappedId) {
      const newPieces = pieces.map(p => ({ ...p, selected: false }));
      this.setData({ pieces: newPieces, selectedId: -1 });
    } else {
      this.swapPieces(selectedId, tappedId);
    }
  },

  swapPieces(idA, idB) {
    let pieces = this.data.pieces.map(p => ({ ...p }));
    const a = pieces.find(p => p.id === idA);
    const b = pieces.find(p => p.id === idB);

    const tmpRow = a.row;
    const tmpCol = a.col;
    a.row = b.row;
    a.col = b.col;
    b.row = tmpRow;
    b.col = tmpCol;

    pieces = pieces.map(p => ({
      ...p,
      selected: false,
      correct: p.row === p.correctRow && p.col === p.correctCol
    }));

    const moves = this.data.moves + 1;
    this.setData({ pieces, selectedId: -1, moves });

    if (pieces.every(p => p.correct)) {
      this.onPuzzleComplete();
    }
  },

  onPuzzleComplete() {
    this.stopTimer();
    const pd = tt._puzzleData;
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

  nextLevel() {
    const pd = tt._puzzleData;
    const level = pd.currentLevel;

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
      showSuccess: false
    }, () => {
      // 下一关随机加载新的怀旧图片
      this.loadImage();
    });
  },

  togglePreview() {
    this.setData({ showPreview: !this.data.showPreview });
  },

  preventClose() {},

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