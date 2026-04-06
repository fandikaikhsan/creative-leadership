export type CardType = 'color' | 'emoji' | 'word';

export interface ClueCard {
  id: string;
  type: CardType;
  value: string;
  display: string;
  color?: string;
}

export interface Connection {
  answer: string;
  clues: string[]; // card display values
  logic: string;
}

export interface Category {
  name: string;
  connections: Connection[];
}

export const COLOR_CARDS: ClueCard[] = [
  { id: 'c-red', type: 'color', value: 'RED', display: 'Red', color: '#ef4444' },
  { id: 'c-blue', type: 'color', value: 'BLUE', display: 'Blue', color: '#3b82f6' },
  { id: 'c-green', type: 'color', value: 'GREEN', display: 'Green', color: '#22c55e' },
  { id: 'c-yellow', type: 'color', value: 'YELLOW', display: 'Yellow', color: '#eab308' },
  { id: 'c-black', type: 'color', value: 'BLACK', display: 'Black', color: '#1f2937' },
  { id: 'c-white', type: 'color', value: 'WHITE', display: 'White', color: '#f9fafb' },
  { id: 'c-purple', type: 'color', value: 'PURPLE', display: 'Purple', color: '#a855f7' },
  { id: 'c-orange', type: 'color', value: 'ORANGE', display: 'Orange', color: '#f97316' },
  { id: 'c-pink', type: 'color', value: 'PINK', display: 'Pink', color: '#ec4899' },
  { id: 'c-brown', type: 'color', value: 'BROWN', display: 'Brown', color: '#92400e' },
  { id: 'c-grey', type: 'color', value: 'GREY', display: 'Grey', color: '#6b7280' },
  { id: 'c-silver', type: 'color', value: 'SILVER', display: 'Silver', color: '#94a3b8' },
];

export const EMOJI_CARDS: ClueCard[] = [
  { id: 'e-lightning', type: 'emoji', value: 'LIGHTNING_EMOJI', display: '⚡' },
  { id: 'e-spider', type: 'emoji', value: 'SPIDER_EMOJI', display: '🕷' },
  { id: 'e-bat', type: 'emoji', value: 'BAT_EMOJI', display: '🦇' },
  { id: 'e-fire', type: 'emoji', value: 'FIRE_EMOJI', display: '🔥' },
  { id: 'e-snowflake', type: 'emoji', value: 'SNOWFLAKE_EMOJI', display: '❄️' },
  { id: 'e-broom', type: 'emoji', value: 'BROOM_EMOJI', display: '🧹' },
  { id: 'e-owl', type: 'emoji', value: 'OWL_EMOJI', display: '🦉' },
  { id: 'e-lion', type: 'emoji', value: 'LION_EMOJI', display: '🦁' },
  { id: 'e-snake', type: 'emoji', value: 'SNAKE_EMOJI', display: '🐍' },
  { id: 'e-deer', type: 'emoji', value: 'DEER_EMOJI', display: '🦌' },
  { id: 'e-glasses', type: 'emoji', value: 'GLASSES_EMOJI', display: '👓' },
  { id: 'e-mouse', type: 'emoji', value: 'MOUSE_EMOJI', display: '🐭' },
];

export const WORD_CARDS: ClueCard[] = [
  { id: 'w-lightning', type: 'word', value: 'LIGHTNING', display: 'LIGHTNING' },
  { id: 'w-web', type: 'word', value: 'WEB', display: 'WEB' },
  { id: 'w-dark', type: 'word', value: 'DARK', display: 'DARK' },
  { id: 'w-cold', type: 'word', value: 'COLD', display: 'COLD' },
  { id: 'w-scar', type: 'word', value: 'SCAR', display: 'SCAR' },
  { id: 'w-glasses', type: 'word', value: 'GLASSES', display: 'GLASSES' },
  { id: 'w-stick', type: 'word', value: 'STICK', display: 'STICK' },
  { id: 'w-stone', type: 'word', value: 'STONE', display: 'STONE' },
  { id: 'w-forest', type: 'word', value: 'FOREST', display: 'FOREST' },
  { id: 'w-snake', type: 'word', value: 'SNAKE', display: 'SNAKE' },
  { id: 'w-king', type: 'word', value: 'KING', display: 'KING' },
  { id: 'w-small', type: 'word', value: 'SMALL', display: 'SMALL' },
];

export const ALL_CARDS: ClueCard[] = [...COLOR_CARDS, ...EMOJI_CARDS, ...WORD_CARDS];

export const PENALTY_RATES: Record<CardType, number> = {
  color: 2,
  emoji: 4,
  word: 5,
};

export function calculateScore(cards: ClueCard[], guessed: boolean): number {
  if (cards.length === 0) return 0;
  if (cards.length <= 2) return guessed ? 10 : 0;

  const extraCards = cards.slice(2);
  const penalty = extraCards.reduce((sum, card) => sum + PENALTY_RATES[card.type], 0);
  if (guessed) return 10 - penalty;
  return -penalty;
}

export const CATEGORIES: Category[] = [
  {
    name: 'Superheroes',
    connections: [
      { answer: 'Spider-Man', clues: ['🕷', 'Red', 'WEB'], logic: 'Spider + red suit + web-slinger' },
      { answer: 'Batman', clues: ['🦇', 'Black', 'DARK'], logic: 'Bat + dark knight + black' },
      { answer: 'Superman', clues: ['⚡', 'Blue', 'LIGHTNING'], logic: 'Speed + blue suit + lightning fast' },
      { answer: 'Hulk', clues: ['🦁', 'Green', 'STONE'], logic: 'Green + strong as stone' },
      { answer: 'Thor', clues: ['⚡', 'Silver', 'LIGHTNING'], logic: 'Hammer + silver armor + lightning' },
      { answer: 'Iron Man', clues: ['🔥', 'Red', 'STONE'], logic: 'Hot red armor + iron (stone)' },
      { answer: 'Black Panther', clues: ['🦁', 'Black', 'KING'], logic: 'Black cat + king of Wakanda' },
      { answer: 'Wolverine', clues: ['🦁', 'Yellow', 'SCAR'], logic: 'Wolf + yellow suit + claw scars' },
      { answer: 'Deadpool', clues: ['🔥', 'Red', 'SCAR'], logic: 'Red suit + burned/scarred face' },
      { answer: 'Loki', clues: ['🐍', 'Green', 'STICK'], logic: 'Snake + staff/stick + green' },
      { answer: 'Thanos', clues: ['🦁', 'Purple', 'STONE'], logic: 'Purple + infinity stones' },
      { answer: 'Mr. Freeze', clues: ['❄️', 'Blue', 'COLD'], logic: 'Ice cold + blue' },
      { answer: 'Flash', clues: ['⚡', 'Red', 'LIGHTNING'], logic: 'Red + lightning fast' },
      { answer: 'Black Widow', clues: ['🦇', 'Black', 'SCAR'], logic: 'Black + red hourglass scar' },
      { answer: 'Scarlet Witch', clues: ['🔥', 'Red', 'STICK'], logic: 'Red magic + wand/stick' },
      { answer: 'Ant-Man', clues: ['🐍', 'Red', 'SMALL'], logic: 'Ant + red + small size' },
    ],
  },
  {
    name: 'Harry Potter',
    connections: [
      { answer: 'Harry', clues: ['⚡', 'Green', 'SCAR'], logic: 'Lightning scar + green eyes' },
      { answer: 'Hermione', clues: ['🧹', 'Brown', 'STICK'], logic: 'Brown hair + wand stick' },
      { answer: 'Ron', clues: ['🔥', 'Red', 'STICK'], logic: 'Red hair + wand' },
      { answer: 'Dumbledore', clues: ['👓', 'Silver', 'STICK'], logic: 'Silver beard + elder stick (wand)' },
      { answer: 'Snape', clues: ['🦇', 'Black', 'DARK'], logic: 'Black + dark + potions' },
      { answer: 'Voldemort', clues: ['🐍', 'White', 'DARK'], logic: 'Snake + white face + dark lord' },
      { answer: 'Draco', clues: ['🐍', 'Silver', 'STICK'], logic: 'Blonde + Slytherin snake + wand' },
      { answer: 'Hagrid', clues: ['🦉', 'Brown', 'STICK'], logic: 'Brown beard + umbrella stick' },
      { answer: 'Sirius', clues: ['🦁', 'Black', 'DARK'], logic: 'Black dog + dark past' },
      { answer: 'Dobby', clues: ['👓', 'Green', 'SMALL'], logic: 'Big ears + small + green (freedom)' },
      { answer: 'Hedwig', clues: ['🦉', 'White', 'SMALL'], logic: 'White owl + small' },
      { answer: 'Nagini', clues: ['🐍', 'Green', 'DARK'], logic: 'Green snake + dark' },
      { answer: 'Dementor', clues: ['🧹', 'Black', 'COLD'], logic: 'Black + cold + dark' },
      { answer: 'Phoenix', clues: ['🔥', 'Red', 'STONE'], logic: 'Fire + rebirth stone (egg)' },
      { answer: 'Unicorn', clues: ['🦌', 'Silver', 'FOREST'], logic: 'Silver blood + forest' },
      { answer: 'Basilisk', clues: ['🐍', 'Green', 'DARK'], logic: 'Green snake + dark chamber' },
    ],
  },
  {
    name: 'Disney',
    connections: [
      { answer: 'Mickey', clues: ['🐭', 'Red', 'SMALL'], logic: 'Mouse + red shorts + small' },
      { answer: 'Minnie', clues: ['🐭', 'Red', 'SNAKE'], logic: 'Mouse + red + bow (shape)' },
      { answer: 'Elsa', clues: ['❄️', 'Blue', 'COLD'], logic: 'Ice + blue dress + cold' },
      { answer: 'Simba', clues: ['🦁', 'Yellow', 'KING'], logic: 'Lion + gold + king' },
      { answer: 'Scar', clues: ['🦁', 'Black', 'DARK'], logic: 'Lion + black mane + dark' },
      { answer: 'Woody', clues: ['🦌', 'Brown', 'STICK'], logic: 'Cowboy + brown + pull-string' },
      { answer: 'Buzz', clues: ['⚡', 'White', 'STICK'], logic: 'Space + white + laser stick' },
      { answer: 'Nemo', clues: ['🔥', 'Orange', 'SMALL'], logic: 'Fish + orange + small fin' },
      { answer: 'Dory', clues: ['🔥', 'Blue', 'SMALL'], logic: 'Fish + blue + small memory' },
      { answer: 'Moana', clues: ['🦌', 'Orange', 'STICK'], logic: 'Ocean + orange + oar stick' },
      { answer: 'Olaf', clues: ['⛄', 'White', 'STICK'], logic: 'Snowman + white + stick arms' },
      { answer: 'Belle', clues: ['📚', 'Yellow', 'STICK'], logic: 'Book + yellow dress + rose stick' },
      { answer: 'Ariel', clues: ['🐭', 'Red', 'STICK'], logic: 'Mermaid + red hair + dinglehopper' },
      { answer: 'Ursula', clues: ['🐙', 'Purple', 'DARK'], logic: 'Octopus + purple + big' },
      { answer: 'Aladdin', clues: ['🦌', 'Blue', 'STICK'], logic: 'Street rat + blue + lamp stick' },
      { answer: 'Rafiki', clues: ['🦁', 'Red', 'STICK'], logic: 'Monkey + red + staff stick' },
    ],
  },
];

export interface GameConnection {
  cards: ClueCard[];
  guessed: boolean;
  score: number;
}

export interface RoundResult {
  teamIndex: number;
  category: string;
  connections: GameConnection[];
  totalScore: number;
}

export interface GameState {
  teamNames: [string, string];
  totalRounds: number;
  currentRound: number;
  currentTeam: number;
  roundResults: RoundResult[];
  phase: 'setup' | 'category-select' | 'game' | 'round-end' | 'results';
}
