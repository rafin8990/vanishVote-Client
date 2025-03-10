export interface PollOption {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export type ReactionType = 'like' | 'love' | 'haha' | 'sad' | 'angry';

export interface Poll {
  id: string;
  question: string;
  creator: string;
  verified: boolean;
  options: PollOption[];
  totalVotes: number;
  ended: boolean;
  hasVoted: boolean;
  userVote?: string | null;
  endTime?: Date | string;
  reactions?: Record<ReactionType, number>;
  createdAt: Date;
}
