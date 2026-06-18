import type { Character } from '../types';

export const characters: Character[] = [
  {
    id: 'alice',
    name: '爱丽丝',
    description: '记者路线，注重调查和线索收集，惊吓点多与文档和环境叙事相关',
    avatar: '👩',
    color: '#ec4899',
  },
  {
    id: 'john',
    name: '约翰',
    description: '警察路线，注重战斗和探索，惊吓点多与怪物遭遇相关',
    avatar: '👨',
    color: '#3b82f6',
  },
  {
    id: 'maria',
    name: '玛丽亚',
    description: '灵媒路线，注重超自然感知，惊吓点多与灵异现象相关',
    avatar: '👧',
    color: '#8b5cf6',
  },
  {
    id: 'detective',
    name: '侦探',
    description: '二周目隐藏路线，全知视角，惊吓点包含meta元素和彩蛋',
    avatar: '🕵️',
    color: '#f59e0b',
  },
];
