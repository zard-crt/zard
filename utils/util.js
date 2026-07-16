// 工具函数

// 格式化日期
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 生成头像颜色
const avatarColors = [
  'linear-gradient(135deg, #0071E3, #4B9EFF)',
  'linear-gradient(135deg, #FF9F0A, #FFCC02)',
  'linear-gradient(135deg, #30D158, #63E6A0)',
  'linear-gradient(135deg, #FF453A, #FF6961)',
  'linear-gradient(135deg, #BF5AF2, #DA8FFF)',
  'linear-gradient(135deg, #5E5CE6, #7B79F0)',
  'linear-gradient(135deg, #FF6482, #FF8BA3)',
  'linear-gradient(135deg, #00C7BE, #64D2D6)'
]

function getAvatarColor(index) {
  return avatarColors[index % avatarColors.length]
}

// 节流函数
function throttle(fn, delay = 300) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

module.exports = {
  formatDate,
  getAvatarColor,
  throttle
}
