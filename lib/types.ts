export type ReactionType = 'Like' | 'Trending';

export interface Poll {
  question: string;
  questionType: number;
  timeOut: string;
  uuid: string;
  votes: Record<string, number>;
  options: string[];
  voters: Record<string, string>;
  reactions: Record<string, string[]>;
  reactionCounts: Record<ReactionType, number>;
  comments: Comment[];
  verified?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}
