/**
 * 让文件名能够智能排序
 * 例:
 * icon-72x72.png
 * icon-128x128.png
 * icon-384x384.png
 *
 * 默认排序:
 * icon-128x128.png
 * icon-384x384.png
 * icon-72x72.png
 *
 * 智能排序:
 * icon-72x72.png
 * icon-128x128.png
 * icon-384x384.png
 *
 * 学习:https://www.cnblogs.com/zlulu/p/6214758.html
 */
export function FileNameCompare(s1: string, s2: string): number {
  const matchList1: RegExpMatchArray = s1.match(/\d+/g) || []; // 找出字符串s1中的数字
  const matchList2: RegExpMatchArray = s2.match(/\d+/g) || []; // 找出字符串s2中的数字
  const minCount: number = Math.min(matchList1.length, matchList2.length);
  let _t1 = s1;
  let _t2 = s2;
  for (let i = 0; i < minCount; i++) {
    if (_t1.indexOf(matchList1[i]) !== _t2.indexOf(matchList2[i])) {
      break; // 数字位置不同，直接使用字符串比较
    }
    if (s1.substring(0, _t1.indexOf(matchList1[i])) !== s2.substring(0, _t2.indexOf(matchList2[i]))) {
      break; // 数字之前字符不同，直接使用字符串比较
    }
    _t1 = _t1.replace(matchList1[i], '');
    _t2 = _t2.replace(matchList2[i], '');
    if (matchList1[i] === matchList2[i]) {
      continue; // 数字相同时，比较下一组数字
    }
    // 比较数字大小
    const result = parseInt(matchList1[i], 10) - parseInt(matchList2[i], 10);
    if (result !== 0) {
      return result;
    } else {
      // 相等时,字符数多的大(只有前面为0的情况 即: 0001 和 001 数字一样大,但是0001排后)
      return matchList1[i].length - matchList2[i].length;
    }
  }
  return s1.localeCompare(s2);
}
