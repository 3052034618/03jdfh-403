import type { Chapter } from '../types';

export const chapters: Chapter[] = [
  {
    id: 'chapter1',
    name: '第一章：降临',
    description: '主角抵达废弃的黑水镇，开始调查神秘失踪案',
    levels: ['火车站', '主街道', '旅馆', '地下室'],
  },
  {
    id: 'chapter2',
    name: '第二章：真相',
    description: '深入探索黑水镇的秘密，揭开邪教的阴谋',
    levels: ['医院', '学校', '教堂', '地下墓穴'],
  },
  {
    id: 'chapter3',
    name: '第三章：终结',
    description: '最终对决，决定黑水镇和主角的命运',
    levels: ['矿坑', '仪式大厅', '深渊', '结局'],
  },
];

export const saveStateLabels: Record<string, string> = {
  chapter1_start: '第一章 开始',
  chapter1_mid: '第一章 中段（旅馆前）',
  chapter1_end: '第一章 结束（地下室后）',
  chapter2_start: '第二章 开始',
  chapter2_mid: '第二章 中段（学校前）',
  chapter2_end: '第二章 结束（墓穴后）',
  chapter3_start: '第三章 开始',
  chapter3_mid: '第三章 中段（仪式前）',
  ending_a: '结局A（救赎）',
  ending_b: '结局B（堕落）',
};

export const difficultyLabels: Record<string, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
  nightmare: '噩梦',
};
