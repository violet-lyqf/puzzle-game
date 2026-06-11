Page({
  data: {
    level: 1,
    totalScore: 0,
    currentImage: '',
    pieces: [],
    boardSize: 300,
    boardHeight: 400,
    pieceSize: 100,
    pieceSizeH: 133,
    cols: 3,
    rows: 3,
    selectedId: -1,
    draggingId: -1,
    draggingGroupIds: [],
    dragOffsetX: 0,
    dragOffsetY: 0,
    dragX: 0,
    dragY: 0,
    moves: 0,
    timeStr: '00:00',
    seconds: 0,
    showPreview: false,
    showSuccess: false,
    showNumbers: false
  },

  _timer: null,
  _audioCtx: null,
  _longPressTimer: null,
  _isDragging: false,

  onLoad() {
    const pd = tt._puzzleData;
    const sysInfo = tt.getSystemInfoSync();
    const screenWidth = sysInfo.windowWidth;
    const boardSize = Math.floor(screenWidth * 0.92);
    const boardHeight = Math.floor(boardSize * 4 / 3);
    const level = pd.currentLevel;
    let cols = 3;
    if (level >= 4 && level <= 6) cols = 4;
    if (level >= 7) cols = 5;
    const rows = Math.round(cols * 4 / 3);
    const pieceSize = Math.floor(boardSize / cols);
    const pieceSizeH = Math.floor(boardHeight / rows);
    const actualBoardSize = pieceSize * cols;
    const actualBoardHeight = pieceSizeH * rows;
    this.setData({
      level,
      totalScore: pd.totalScore,
      boardSize: actualBoardSize,
      boardHeight: actualBoardHeight,
      pieceSize,
      pieceSizeH,
      cols,
      rows
    });
    this.loadImage();
  },

  onUnload() {
    this.stopTimer();
    if (this._audioCtx) {
      this._audioCtx.destroy();
      this._audioCtx = null;
    }
  },

  // ─── 通关音效 ───────────────────────────────────────────────────────────
  playSuccessSound() {
    try {
      const ctx = tt.createInnerAudioContext();
      this._audioCtx = ctx;
      // 使用系统内置音效频率合成通关音
      ctx.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
      ctx.volume = 1;
      ctx.play();
      // 1秒后自动停止
      setTimeout(() => {
        ctx.stop();
        ctx.destroy();
        this._audioCtx = null;
      }, 1000);
    } catch(e) {
      // 音效失败不影响游戏
    }
  },

  loadImage() {
    const pd = tt._puzzleData;
    const imageUrl = pd.getRandomRetroImage();
    pd.currentImage = imageUrl;
    tt.showLoading({ title: '图片生成中...' });
    tt.getImageInfo({
      src: imageUrl,
      success: () => {
        tt.hideLoading();
        this.setData({ currentImage: imageUrl }, () => {
          this.initPuzzle();
        });
      },
      fail: () => {
        tt.hideLoading();
        const fallbackUrl = pd.getFallbackImage ? pd.getFallbackImage() : pd.getRandomRetroImage();
        pd.currentImage = fallbackUrl;
        this.setData({ currentImage: fallbackUrl }, () => {
          this.initPuzzle();
        });
      }
    });
  },

  initPuzzle() {
    const { cols, rows, pieceSize, pieceSizeH } = this.data;
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
        correct: false,
        dragging: false,
        dragDeltaX: 0,
        dragDeltaY: 0,
        groupId: i  // 初始每块自成一组
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

  // ─── 触摸开始 ──────────────────────────────────────────────────────────
  onPieceTouchStart(e) {
    if (this.data.showSuccess) return;
    const pieceId = parseInt(e.currentTarget.dataset.id);
    const { pieces, pieceSize, pieceSizeH } = this.data;
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const touch = e.touches[0];
    this._touchStartX = touch.clientX;
    this._touchStartY = touch.clientY;
    this._touchMoved = false;
    this._touchPieceId = pieceId;
    this._isDragging = false;

    // 找出同组所有切片（同一 groupId）
    const groupId = piece.groupId;
    const groupIds = pieces.filter(p => p.groupId === groupId).map(p => p.id);

    this._pendingDrag = {
      pieceId,
      piece,
      groupIds,
      offsetX: touch.clientX - piece.col * pieceSize,
      offsetY: touch.clientY - piece.row * pieceSizeH
    };
  },

  // ─── 棋盘触摸移动（阻止页面滚动）────────────────────────────────────────
  onBoardTouchMove(e) {},

  // ─── 长按（震动提示）────────────────────────────────────────────────────
  onPieceLongPress(e) {
    if (this.data.showSuccess) return;
    tt.vibrateShort();
  },

  // ─── 拖动移动 ───────────────────────────────────────────────────────────
  onPieceTouchMove(e) {
    if (this.data.showSuccess) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this._touchStartX;
    const dy = touch.clientY - this._touchStartY;

    // 移动超过阈值，激活拖动
    if (!this._isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      this._touchMoved = true;
      this._isDragging = true;

      if (!this._pendingDrag) return;
      const { pieceId, groupIds, offsetX, offsetY } = this._pendingDrag;
      const { pieces } = this.data;
      const newPieces = pieces.map(p => ({
        ...p,
        selected: false,
        dragging: groupIds.includes(p.id),
        dragDeltaX: 0,
        dragDeltaY: 0
      }));
      this.setData({
        pieces: newPieces,
        draggingId: pieceId,
        draggingGroupIds: groupIds,
        dragOffsetX: offsetX,
        dragOffsetY: offsetY,
        selectedId: -1
      });
    }

    if (!this._isDragging) return;

    const { dragOffsetX, dragOffsetY, pieceSize, pieceSizeH, boardSize, boardHeight, draggingGroupIds, pieces, draggingId } = this.data;
    const draggingPiece = pieces.find(p => p.id === draggingId);
    if (!draggingPiece) return;

    const rawX = touch.clientX - dragOffsetX;
    const rawY = touch.clientY - dragOffsetY;
    const clampedX = Math.max(0, Math.min(rawX, boardSize - pieceSize));
    const clampedY = Math.max(0, Math.min(rawY, boardHeight - pieceSizeH));

    const deltaX = clampedX - draggingPiece.col * pieceSize;
    const deltaY = clampedY - draggingPiece.row * pieceSizeH;

    const newPieces = pieces.map(p => {
      if (!draggingGroupIds.includes(p.id)) return p;
      return { ...p, dragDeltaX: deltaX, dragDeltaY: deltaY };
    });
    this.setData({ pieces: newPieces, dragX: clampedX, dragY: clampedY });
  },

  // ─── 触摸结束 ──────────────────────────────────────────────────────────
  onPieceTouchEnd(e) {
    if (this.data.showSuccess) return;

    // 未移动 = 点击交换
    if (!this._touchMoved) {
      this._isDragging = false;
      const tappedId = this._touchPieceId;
      const { selectedId, pieces } = this.data;
      const cleanPieces = pieces.map(p => ({ ...p, dragging: false, dragDeltaX: 0, dragDeltaY: 0 }));
      if (selectedId === -1) {
        this.setData({ pieces: cleanPieces.map(p => ({ ...p, selected: p.id === tappedId })), selectedId: tappedId });
      } else if (selectedId === tappedId) {
        this.setData({ pieces: cleanPieces.map(p => ({ ...p, selected: false })), selectedId: -1 });
      } else {
        this.swapPieces(selectedId, tappedId);
      }
      return;
    }

    if (!this._isDragging) return;
    this._isDragging = false;
    this._touchMoved = false;

    const { dragX, dragY, pieceSize, pieceSizeH, draggingId, draggingGroupIds, pieces, cols, rows } = this.data;
    const draggingPiece = pieces.find(p => p.id === draggingId);
    if (!draggingPiece) return;

    const targetCol = Math.min(cols - 1, Math.max(0, Math.round(dragX / pieceSize)));
    const targetRow = Math.min(rows - 1, Math.max(0, Math.round(dragY / pieceSizeH)));
    const deltaCol = targetCol - draggingPiece.col;
    const deltaRow = targetRow - draggingPiece.row;

    if (deltaCol === 0 && deltaRow === 0) {
      const newPieces = pieces.map(p => ({ ...p, dragging: false, dragDeltaX: 0, dragDeltaY: 0 }));
      this.setData({ pieces: newPieces, draggingId: -1, draggingGroupIds: [], dragX: 0, dragY: 0 });
      return;
    }

    const groupIds = draggingGroupIds;
    let newPieces = pieces.map(p => ({ ...p }));

    // 越界检查
    const outOfBounds = groupIds.some(gid => {
      const gp = newPieces.find(p => p.id === gid);
      return (gp.col + deltaCol) < 0 || (gp.col + deltaCol) >= cols ||
             (gp.row + deltaRow) < 0 || (gp.row + deltaRow) >= rows;
    });
    if (outOfBounds) {
      const cancelPieces = pieces.map(p => ({ ...p, dragging: false, dragDeltaX: 0, dragDeltaY: 0 }));
      this.setData({ pieces: cancelPieces, draggingId: -1, draggingGroupIds: [], dragX: 0, dragY: 0 });
      return;
    }

    // 先移走被覆盖位置的非组切片
    groupIds.forEach(gid => {
      const gp = newPieces.find(p => p.id === gid);
      const newCol = gp.col + deltaCol;
      const newRow = gp.row + deltaRow;
      const displaced = newPieces.find(p => p.col === newCol && p.row === newRow && !groupIds.includes(p.id));
      if (displaced) { displaced.col = gp.col; displaced.row = gp.row; }
    });

    // 移动组内所有切片
    groupIds.forEach(gid => {
      const gp = newPieces.find(p => p.id === gid);
      gp.col += deltaCol;
      gp.row += deltaRow;
    });

    // 更新正确性
    newPieces = newPieces.map(p => ({
      ...p,
      dragging: false,
      dragDeltaX: 0,
      dragDeltaY: 0,
      correct: p.col === p.correctCol && p.row === p.correctRow
    }));

    // 移动后重新合并连接组
    newPieces = this.mergeGroups(newPieces);

    const moves = this.data.moves + 1;
    this.setData({ pieces: newPieces, draggingId: -1, draggingGroupIds: [], dragX: 0, dragY: 0, moves });
    if (newPieces.every(p => p.correct)) this.onPuzzleComplete();
  },

  // ─── 并查集：合并连接组 ─────────────────────────────────────────────────
  mergeGroups(pieces) {
    // 初始化并查集，每块自成一组
    const parent = {};
    pieces.forEach(p => { parent[p.id] = p.id; });

    // 查找根节点（路径压缩）
    const find = (id) => {
      if (parent[id] !== id) parent[id] = find(parent[id]);
      return parent[id];
    };

    // 合并两个节点
    const union = (a, b) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
    };

    // 遍历所有正确切片，找相邻且原图也相邻的切片合并
    pieces.forEach(p => {
      if (!p.correct) return;
      pieces.forEach(q => {
        if (q.id <= p.id || !q.correct) return;
        // 棋盘上当前位置相邻（曼哈顿距离=1）
        const boardAdj = Math.abs(p.col - q.col) + Math.abs(p.row - q.row) === 1;
        // 原图中正确位置也相邻（确保是真正拼好的连接）
        const imageAdj = Math.abs(p.correctCol - q.correctCol) + Math.abs(p.correctRow - q.correctRow) === 1;
        if (boardAdj && imageAdj) union(p.id, q.id);
      });
    });

    // 将 groupId 设为并查集根节点
    return pieces.map(p => ({
      ...p,
      groupId: p.correct ? find(p.id) : p.id
    }));
  },

  // ─── 点击交换 ────────────────────────────────────────────────────────────
  onPieceTap(e) {},

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
    // 交换后重新合并连接组
    pieces = this.mergeGroups(pieces);
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
    // 播放通关音效1秒
    this.playSuccessSound();
    // 震动反馈
    tt.vibrateShort();
    // 1秒后显示成功弹窗
    setTimeout(() => {
      this.setData({ totalScore: newScore, showSuccess: true });
    }, 1000);
  },

  nextLevel() {
    const pd = tt._puzzleData;
    const level = pd.currentLevel;
    let cols = 3;
    if (level >= 4 && level <= 6) cols = 4;
    if (level >= 7) cols = 5;
    const rows = Math.round(cols * 4 / 3);
    const pieceSize = Math.floor(this.data.boardSize / cols);
    const pieceSizeH = Math.floor(this.data.boardHeight / rows);
    const actualBoardSize = pieceSize * cols;
    const actualBoardHeight = pieceSizeH * rows;
    this.setData({
      level,
      cols,
      rows,
      pieceSize,
      pieceSizeH,
      boardSize: actualBoardSize,
      boardHeight: actualBoardHeight,
      showSuccess: false
    }, () => {
      this.loadImage();
    });
  },

  togglePreview() {
    this.setData({ showPreview: !this.data.showPreview });
  },

  preventClose() {},

  preventScroll() {
    // 阻止页面滚动和返回手势
    return false;
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