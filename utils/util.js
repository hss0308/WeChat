const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const startDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = 1;
  return [year, month, day].map(formatNumber).join('-')
}

const endDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = getMonthDays(month);
  return [year, month, day].map(formatNumber).join('-')
}

const getMonthDays = myMonth => {
  let now = new Date();
  let monthStartDate = new Date(now.getYear(), myMonth, 1);
  let monthEndDate = new Date(now.getYear(), myMonth + 1, 1);
  let days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
  return days;
}


module.exports = {
  formatTime: formatTime, startDate: startDate, endDate: endDate
}
