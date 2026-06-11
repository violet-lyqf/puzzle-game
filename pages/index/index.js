Page({
  data: {
    totalScore: 0,
    currentLevel: 1,
    passedLevel: 0
  },

    onShow() {
      const pd = tt._puzzleData;
      this.setData({
        totalScore: pd.totalScore,
        currentLevel: pd.currentLevel,
        passedLevel: pd.currentLevel - 1
      });
  },

  startGame() {
    tt.navigateTo({
      url: '/pages/game/game'
    });
  },

    showScore() {
      const { totalScore, currentLevel } = tt._puzzleData;
    tt.showModal({
      title: '🏆 积分详情',
      content: `总积分：${totalScore} 分\n已完成关卡：${currentLevel - 1} 关\n每关奖励：10 分`,
      showCancel: false,
      confirmText: '太棒了'
    });
  },

  resetGame() {
    tt.showModal({
      title: '⚠️ 确认重置',
      content: '重置后积分和关卡进度将清零，确定吗？',
      confirmText: '确定重置',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
                    tt._puzzleData.totalScore = 0;
                    tt._puzzleData.currentLevel = 1;
                    tt._puzzleData.save();
          this.setData({
            totalScore: 0,
            currentLevel: 1,
            passedLevel: 0
          });
          tt.showToast({ title: '进度已重置', icon: 'success' });
        }
      }
    });
  }
});