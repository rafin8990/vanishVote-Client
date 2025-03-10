import { addDays, addHours } from 'date-fns';
import type { Poll } from './types';

export const polls: Poll[] = [
  {
    id: '1',
    question: 'Should Ethereum switch the consensus mechanism to PoS ?',
    creator: 'hamersel.sol',
    verified: true,
    options: [
      {
        id: 'yes',
        label: 'Yes',
        votes: 61180,
        percentage: 53.2,
      },
      {
        id: 'no',
        label: 'No',
        votes: 39220,
        percentage: 34.1,
      },
      {
        id: 'neutral',
        label: 'Neutral',
        votes: 18623,
        percentage: 16.23,
      },
    ],
    totalVotes: 115023,
    ended: true,
    hasVoted: true,
    userVote: 'yes',
    reactions: {
      like: 142,
      love: 87,
      haha: 56,
      sad: 34,
      angry: 23,
    },
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    question: 'Which blockchain has the best developer experience?',
    creator: 'devtools.eth',
    verified: true,
    options: [
      {
        id: 'ethereum',
        label: 'Ethereum',
        votes: 1250,
        percentage: 42.5,
      },
      {
        id: 'solana',
        label: 'Solana',
        votes: 850,
        percentage: 28.9,
      },
      {
        id: 'polygon',
        label: 'Polygon',
        votes: 520,
        percentage: 17.7,
      },
      {
        id: 'other',
        label: 'Other',
        votes: 320,
        percentage: 10.9,
      },
    ],
    totalVotes: 2940,
    ended: false,
    hasVoted: true,
    userVote: 'ethereum',
    endTime: addDays(new Date(), 2), // Poll ends in 2 days
    reactions: {
      like: 45,
      love: 22,
      haha: 10,
      sad: 5,
      angry: 5,
    },
    createdAt: new Date('2023-03-22'),
  },
  {
    id: '3',
    question: "What's your favorite NFT marketplace?",
    creator: 'nft.collector',
    verified: true,
    options: [
      {
        id: 'opensea',
        label: 'OpenSea',
        votes: 320,
        percentage: 45.7,
      },
      {
        id: 'rarible',
        label: 'Rarible',
        votes: 180,
        percentage: 25.7,
      },
      {
        id: 'foundation',
        label: 'Foundation',
        votes: 120,
        percentage: 17.1,
      },
      {
        id: 'other',
        label: 'Other',
        votes: 80,
        percentage: 11.5,
      },
    ],
    totalVotes: 700,
    ended: false,
    hasVoted: false,
    endTime: addHours(new Date(), 6), // Poll ends in 6 hours
    reactions: {
      like: 25,
      love: 15,
      haha: 5,
      sad: 2,
      angry: 1,
    },
    createdAt: new Date('2023-04-10'),
  },
];
