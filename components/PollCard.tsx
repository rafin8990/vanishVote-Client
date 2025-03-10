'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Poll, ReactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Clock, Frown, Heart, Share2, Smile, ThumbsUp, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const [hasVoted, setHasVoted] = useState(poll.hasVoted);
  const [localPoll, setLocalPoll] = useState<Poll>(poll);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Record<ReactionType, number>>({
    like: poll.reactions?.like || 0,
    love: poll.reactions?.love || 0,
    haha: poll.reactions?.haha || 0,
    sad: poll.reactions?.sad || 0,
    angry: poll.reactions?.angry || 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isPollEnded, setIsPollEnded] = useState(poll.ended);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [userVote, setUserVote] = useState<string | null>(poll.userVote || null);

  // Refs for reaction container and timeout
  const reactionContainerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if poll has ended based on endTime
  useEffect(() => {
    if (localPoll.endTime) {
      const endTime = new Date(localPoll.endTime);
      const checkIfEnded = () => {
        const now = new Date();
        if (now >= endTime && !isPollEnded) {
          setIsPollEnded(true);
        }

        // Calculate time left
        if (now < endTime) {
          const diff = endTime.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h left`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m left`);
          } else if (minutes > 0) {
            setTimeLeft(`${minutes}m left`);
          } else {
            setTimeLeft('Ending soon');
          }
        } else {
          setTimeLeft('');
        }
      };

      checkIfEnded();
      const interval = setInterval(checkIfEnded, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [localPoll.endTime, isPollEnded]);

  // Handle clicks outside the reaction container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionContainerRef.current &&
        !reactionContainerRef.current.contains(event.target as Node)
      ) {
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleVote = (optionId: string) => {
    if (isPollEnded) return; // Cannot vote if poll ended

    // If user has already voted for this option, do nothing
    if (userVote === optionId) return;

    // Update the poll data locally to simulate voting
    let updatedOptions;

    if (userVote) {
      // User is changing their vote - remove previous vote and add new one
      updatedOptions = localPoll.options.map((option) => {
        if (option.id === userVote) {
          // Decrease vote for previously selected option
          return {
            ...option,
            votes: Math.max(0, option.votes - 1),
          };
        } else if (option.id === optionId) {
          // Increase vote for newly selected option
          return {
            ...option,
            votes: option.votes + 1,
          };
        }
        return option;
      });
    } else {
      // First time voting
      updatedOptions = localPoll.options.map((option) => {
        if (option.id === optionId) {
          return {
            ...option,
            votes: option.votes + 1,
          };
        }
        return option;
      });
    }

    const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0);

    // Calculate new percentages
    const updatedOptionsWithPercentages = updatedOptions.map((option) => ({
      ...option,
      percentage: Number(((option.votes / totalVotes) * 100).toFixed(2)),
    }));

    setLocalPoll({
      ...localPoll,
      options: updatedOptionsWithPercentages,
      totalVotes: userVote ? totalVotes : totalVotes + 1, // Only increment total if first vote
    });

    setUserVote(optionId);

    setHasVoted(true);
  };

  const handleReact = (type: ReactionType) => {
    // If user already reacted with this type, remove it
    if (userReaction === type) {
      setReactions({
        ...reactions,
        [type]: Math.max(0, reactions[type] - 1),
      });
      setUserReaction(null);
    }
    // If user reacted with a different type, update both
    else if (userReaction) {
      setReactions({
        ...reactions,
        [userReaction]: Math.max(0, reactions[userReaction] - 1),
        [type]: reactions[type] + 1,
      });
      setUserReaction(type);
    }
    // If user hasn't reacted yet
    else {
      setReactions({
        ...reactions,
        [type]: reactions[type] + 1,
      });
      setUserReaction(type);
    }

    // Don't hide reactions immediately after selecting one
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: localPoll.question,
          text: `Check out this poll: ${localPoll.question}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error('Error sharing:', err);
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Poll link copied to clipboard!');
    }
  };

  const getOptionColor = (index: number) => {
    const colors = [
      'from-green-500 to-green-400', // Yes - green
      'from-pink-500 to-pink-400', // No - pink
      'from-yellow-400 to-yellow-300', // Neutral - yellow
    ];
    return colors[index % colors.length];
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  const getReactionIcon = (type: ReactionType) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="h-4 w-4" />;
      case 'love':
        return <Heart className="h-4 w-4" />;
      case 'haha':
        return <Smile className="h-4 w-4" />;
      case 'sad':
        return <Frown className="h-4 w-4" />;
      case 'angry':
        return <X className="h-4 w-4" />;
    }
  };

  const getReactionColor = (type: ReactionType) => {
    switch (type) {
      case 'like':
        return 'text-blue-500';
      case 'love':
        return 'text-red-500';
      case 'haha':
        return 'text-yellow-500';
      case 'sad':
        return 'text-purple-500';
      case 'angry':
        return 'text-orange-500';
      default:
        return 'text-gray-400';
    }
  };

  // Toggle reactions on click (alternative to hover)
  const toggleReactions = () => {
    setShowReactions(!showReactions);
  };

  return (
    <div
      className={cn(
        'bg-gray-900 rounded-lg overflow-hidden shadow-xl transition-all duration-300',
        isPollEnded && 'border-2 border-red-500',
      )}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center">
          <Link href="/" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="ml-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">POLL RESULTS</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white">{localPoll.question}</h2>

        <div className="flex items-center text-sm text-gray-400">
          <span>Created by </span>
          <Link href="#" className="ml-1 text-green-400 hover:underline flex items-center">
            {localPoll.creator}
            {localPoll.verified && (
              <svg
                className="w-3 h-3 ml-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </Link>
        </div>

        {isPollEnded && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-md p-2 text-red-400 text-sm">
            This poll has ended. Voting is no longer available.
          </div>
        )}

        <div className="space-y-3 mt-6">
          {localPoll.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              disabled={isPollEnded}
              className={cn(
                'w-full relative rounded-full overflow-hidden h-12 flex items-center transition-all duration-200',
                isPollEnded
                  ? 'cursor-default opacity-90'
                  : 'cursor-pointer hover:opacity-90 hover:shadow-md',
                userVote === option.id && 'ring-2 ring-white ring-opacity-50',
                hoveredOption === option.id && !isPollEnded && 'transform scale-[1.01]',
              )}
            >
              <div
                className={cn(
                  'absolute left-0 top-0 h-full bg-gradient-to-r transition-all duration-500',
                  getOptionColor(index),
                )}
                style={{ width: `${option.percentage}%` }}
              />
              <div className="absolute left-0 top-0 h-full w-full flex items-center justify-between px-4">
                <span className="font-bold text-black z-10 ml-2">{option.percentage}%</span>
                <span className="font-medium text-white z-10">{option.label}</span>
              </div>
              {userVote === option.id && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 rounded-full p-1 z-20">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 13L9 17L19 7"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {!isPollEnded && hasVoted && (
          <div className="text-sm text-gray-400 italic">
            You can change your vote until the poll ends.
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <Avatar key={i} className="border-2 border-gray-900 w-8 h-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                  <AvatarFallback>{`U${i + 1}`}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-400">
              {localPoll.totalVotes.toLocaleString()} People voted
            </span>
          </div>

          <div className="flex items-center text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span className={cn('text-sm', isPollEnded && 'text-red-400')}>
              {isPollEnded ? 'Poll Ended' : timeLeft || 'Poll Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          {/* Reaction container with ref */}
          <div ref={reactionContainerRef} className="relative">
            {/* Main reaction button - now toggles on click */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-gray-400 hover:text-white',
                userReaction && getReactionColor(userReaction),
              )}
              onClick={toggleReactions}
            >
              {userReaction ? getReactionIcon(userReaction) : <ThumbsUp className="h-4 w-4" />}
              <span className="ml-2">{getTotalReactions()}</span>
            </Button>

            {/* Reaction options panel */}
            <div
              className={cn(
                'absolute bottom-full left-0 mb-2 bg-gray-800 rounded-full p-2 flex space-x-2 shadow-lg transition-all duration-200 z-10',
                showReactions
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2 pointer-events-none',
              )}
            >
              {(['like', 'love', 'haha', 'sad', 'angry'] as ReactionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleReact(type)}
                  className={cn(
                    'p-3 rounded-full hover:bg-gray-700 transition-colors',
                    userReaction === type && 'bg-gray-700',
                  )}
                >
                  <span className={cn('text-xl', getReactionColor(type))}>
                    {getReactionIcon(type)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            <span>Share</span>
          </Button>
        </div>

        {getTotalReactions() > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(reactions).map(([type, count]) =>
              count > 0 ? (
                <div
                  key={type}
                  className={cn(
                    'flex items-center text-xs px-2 py-1 rounded-full bg-gray-800',
                    getReactionColor(type as ReactionType),
                  )}
                >
                  {getReactionIcon(type as ReactionType)}
                  <span className="ml-1">{count}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
}
