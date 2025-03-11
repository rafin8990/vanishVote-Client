"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import axios from "axios";
import cookie from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setValue } from "@/redux/slices/voteSlice";
import PollCardCommentForm from "./PollCardCommentForm";

interface PollCardProps {
  poll: any | null;
}
const formatTime = (time: string | Date) => {
  const date = new Date(time);
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export default function PollCard({ poll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  let savedId = cookie.get("userId");

  const generateUserId = () => {
    const newUserId = Math.random().toString(36).substr(2, 9);
    cookie.set("userId", newUserId);
    return newUserId;
  };

  const userId = savedId || generateUserId();
  const pollId = poll._id;
  const dispatch = useDispatch();
  const selectedValue = useSelector((state: RootState) => state.vote.value);

  const handleVote = async (option: string) => {
    try {
      console.log(option);
      const response = await axios.post(
        `https://vanish-vote-murex.vercel.app/api/v1/poll/${pollId}/${userId}/vote`,
        { option }
      );

      console.log(response.data);
      cookie.set("userVote", option, { expires: 365 });
      setSelectedOption(option);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== option) {
      handleVote(option);
      dispatch(setValue(option));
    }
  };

  const date = new Date();
  const currentDate = formatTime(date);

  // Array of random profile pictures
  const profilePictures = [
    "/placeholder.svg?height=40&width=40&text=1",
    "/placeholder.svg?height=40&width=40&text=2",
    "/placeholder.svg?height=40&width=40&text=3",
    "/placeholder.svg?height=40&width=40&text=4",
  ];

  const getRandomProfilePicture = () => {
    const randomIndex = Math.floor(Math.random() * profilePictures.length);
    return profilePictures[randomIndex];
  };

  // reaction
  const handleReaction = async (reaction: string) => {
    try {
      const response = await axios.post(
        `https://vanish-vote-murex.vercel.app/api/v1/poll/${pollId}/${userId}/reaction`,
        { reaction }
      );

      console.log(response.data);
    } catch (error) {
      console.error("Error updating reaction counts:", error);
    }
  };

  const totalVotes: number = poll?.votes
    ? Object.values(poll.votes).reduce(
        (acc: number, vote: any) => acc + vote,
        0
      )
    : 0;

  // Using your existing state and functions
  // const [hoveredOption, setHoveredOption] = useState(null);

  // Colors for the progress bars (using your existing array)
  const colors = [
    "bg-purple-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-pink-600",
    "bg-red-600",
    "bg-green-600",
  ];

  // Using your existing findWinningOption function
  const findWinningOption = () => {
    if (!poll?.votes) return null;

    let maxVotes = 0;
    let winningOption = null;

    Object.entries(poll.votes).forEach(([option, votes]) => {
      if (Number(votes) > maxVotes) {
        maxVotes = Number(votes);
        winningOption = option;
      }
    });

    return winningOption;
  };

  const winningOption = findWinningOption();

  const [copied, setCopied] = useState(false);
  const pollUrl = `http://localhost:3000/poll/${poll.uuid}/${pollId}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(pollUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  console.log(pollUrl);

  if (!poll?.votes)
    return <div className="text-white">Loading poll data...</div>;

  return (
    <div>
      {currentDate > formatTime(poll.timeOut) ? (
        <div>
          <h2 className="text-xl font-bold text-white">{poll?.question}</h2>
          <div className="p-6 space-y-4">
            {Object.entries(poll.votes).map(([option, votes], index) => {
              const optionVotes = Number(votes);
              const percentage =
                totalVotes > 0
                  ? ((optionVotes / totalVotes) * 100).toFixed(1)
                  : 0;
              const isWinner = option === winningOption;
              const colorClass = colors[index % colors.length];

              return (
                <div
                  key={option}
                  className="space-y-2"
                  // onMouseEnter={() => setHoveredOption(option)}
                  // onMouseLeave={() => setHoveredOption(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span
                        className={`text-white font-medium ${
                          isWinner ? "flex items-center" : ""
                        }`}
                      >
                        {option}
                        {isWinner && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500 text-black rounded-md font-bold">
                            LEADING
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">
                        {optionVotes} votes
                      </span>
                      <span className="text-white font-bold">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-8 w-full bg-gray-800 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full ${colorClass} rounded-lg transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Percentage on the bar for larger percentages */}
                    {Number(percentage) > 10 && (
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-white font-medium text-sm drop-shadow-md">
                          {option}
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
          {/* {poll?.options.map((option: string) => {
          const optionVotes = poll.votes[option] || 0;
          const percentage = totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(2) : 0;
          return (
            <div key={option} className="flex items-center justify-between">
              <span className="text-white">{option}</span>
              <span className="text-gray-400">{percentage}%</span>
            </div>
          );
        })} */}
        </div>
      ) : (
        <div
          className={cn(
            `bg-gray-900  rounded-lg overflow-hidden shadow-xl transition-all duration-300`
          )}
        >
          <div className="flex gap-5">
            <div className="p-5 space-y-4 w-full">
              <div className="flex items-center">
                <div className="ml-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    POLL RESULTS
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white">{poll?.question}</h2>

              <div className="space-y-3 mt-6">
                {poll?.options.map((option: string) => (
                  <button
                    key={option}
                    disabled={selectedValue === option}
                    className={cn(
                      "w-full relative rounded-full overflow-hidden h-12 flex items-center transition-all duration-200",
                      selectedValue === option ? "bg-green-500" : "bg-gray-700"
                    )}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div
                      className={cn(
                        "absolute left-0 top-0 h-full w-full flex items-center justify-between px-4"
                      )}
                    >
                      <span
                        className={cn(
                          "font-bold text-black z-10 ml-2",
                          selectedValue === option
                            ? "text-white"
                            : "text-gray-400"
                        )}
                      >
                        {selectedValue === option ? "✓" : ""}
                      </span>
                      <span className="font-medium text-white z-10">
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <span className="ml-2 text-sm text-gray-400">
                    {totalVotes} People voted
                  </span>
                </div>

                <div className="flex gap-1 items-center text-gray-400">
                  <Clock size={16} />
                  {/* <span>Validity : </span> */}
                  <span className="text-sm">{formatTime(poll.timeOut)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-black"
                      onClick={() => handleReaction("Trending")}
                    >
                      {poll?.reactionCounts?.Trending || 0}
                      🔥
                    </Button>
                  </div>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-black"
                      onClick={() => handleReaction("Like")}
                    >
                      <span>{poll?.reactionCounts?.Like || 0}</span>
                      👍
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Button
                    variant="ghost"
                    type="button"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-black"
                    onClick={handleCopyLink}
                  >
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                </div>
              </div>

              <div>
                <PollCardCommentForm pollId={poll?._id} />
              </div>
            </div>
            <div className="w-full text-white p-5 space-y-3">
              <p>Comments</p>
              {poll.comments &&
                poll.comments.map((comment: any, index: number) => (
                  <div
                    key={comment.id || Math.random()}
                    className="border-b border-gray-700 pb-3 last:border-b-0"
                  >
                    {/* Added profile picture and username */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-800">
                        <img
                          src={getRandomProfilePicture()}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Anonymous #{index + 1}</p>
                      </div>
                    </div>

                    <p className="text-sm italic ml-13">{comment.text}</p>
                    <p className="text-xs text-gray-400 ml-13">
                      {formatTime(comment.createdAt)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
