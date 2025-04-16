const Post = require('../models/msg');

function getMonthYearLabels(num) {
  const labels = [];
  const now = new Date();

  for (let i = num - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    labels.push(label);
  }

  return labels;
}

function getYearLabels(num) {
  const currentYear = new Date().getFullYear();
  const labels = [];
  for (let i = num - 1; i >= 0; i--) {
    labels.push((currentYear - i).toString());
  }
  return labels;
}

async function getPostsByTime(period, num) {
  const now = new Date();
  let start;

  if (period === 'month') {
    // Go to first day of (now - num + 1) months ago
    start = new Date(now.getFullYear(), now.getMonth() - (num - 1), 1);
  } else {
    start = new Date(now.getFullYear() - (num - 1), 0, 1);
  }

  const groupFormat = period === 'month'
    ? { $dateToString: { format: "%b %Y", date: "$createdAt" } } // ex: "Apr 2025"
    : { $dateToString: { format: "%Y", date: "$createdAt" } };

  const results = await Post.aggregate([
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: groupFormat, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const dbData = {};
  results.forEach(entry => {
    dbData[entry._id] = entry.count;
  });

  const labels = period === 'month' ? getMonthYearLabels(num) : getYearLabels(num);
  const finalData = labels.map(label => ({
    label,
    count: dbData[label] || 0
  }));

  return finalData;
}

module.exports = { getPostsByTime };
