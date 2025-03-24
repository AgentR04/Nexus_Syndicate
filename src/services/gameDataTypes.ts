// Game data types for UI components

export interface UIFaction {
  id: string;
  name: string;
  description: string;
  image: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface UIPlaystyle {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UIAvatar {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Default playstyles for the game
export const DEFAULT_PLAYSTYLES: UIPlaystyle[] = [
  {
    id: 'trader',
    name: 'Market Manipulator',
    description: 'Focus on economic domination through trading and market control.',
    icon: '💹'
  },
  {
    id: 'territorial',
    name: 'Territory Controller',
    description: 'Expand your influence by claiming and defending strategic locations.',
    icon: '🏙️'
  },
  {
    id: 'diplomat',
    name: 'Alliance Builder',
    description: 'Form powerful alliances and leverage diplomatic relations.',
    icon: '🤝'
  },
  {
    id: 'technologist',
    name: 'Tech Innovator',
    description: 'Research cutting-edge technologies to gain competitive advantages.',
    icon: '🔬'
  }
];

// Default avatars for the game
export const DEFAULT_AVATARS: UIAvatar[] = [
  {
    id: 'avatar-1',
    name: 'Neon Ronin',
    image: '/avatar1.png',
    rarity: 'common'
  },
  {
    id: 'avatar-2',
    name: 'Digital Samurai',
    image: '/avatar2.png',
    rarity: 'common'
  },
  {
    id: 'avatar-3',
    name: 'Cyber Huntress',
    image: '/avatar3.png',
    rarity: 'rare'
  },
  {
    id: 'avatar-4',
    name: 'Ghost Protocol',
    image: '/avatar4.png',
    rarity: 'rare'
  },
  {
    id: 'avatar-5',
    name: 'Neural Phantom',
    image: '/avatar5.png',
    rarity: 'epic'
  },
  {
    id: 'avatar-6',
    name: 'Quantum Shadow',
    image: '/avatar6.png',
    rarity: 'legendary'
  }
];
