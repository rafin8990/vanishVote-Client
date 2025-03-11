"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import axios from "axios";
import cookie from "js-cookie";

interface PollCardProps {
  poll: any | null;
}

export default function PollCard({ poll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const savedId = cookie.get("userId");

  useEffect(() => {
    const loadUserVote = async () => {
      if (!savedId) return;  

      try {
       
        const response = await axios.get(
          `http://localhost:5000/api/v1/poll/${poll._id}/${savedId}/vote`
        );

        const userVote = response.data?.vote;
        if (userVote) {
          setSelectedOption(userVote); 
        }
      } catch (error) {
        console.error("Error fetching previous vote:", error);
      }
    };

    loadUserVote();
  }, [poll._id, savedId]);

  const handleVote = async (option: string) => {
    const userId = savedId || generateUserId();
    const pollId = poll._id;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/poll/${pollId}/${userId}/vote`,
        { option }
      );

      console.log(response.data);
      cookie.set("userVote", option, { expires: 365 }); 
      setSelectedOption(option);  
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const generateUserId = () => {
    const newUserId = Math.random().toString(36).substr(2, 9);
    cookie.set("userId", newUserId);
    return newUserId;
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== option) {
      handleVote(option);  
    }
  };

  return (
    <div
      className={cn(
        "bg-gray-900 rounded-lg overflow-hidden shadow-xl transition-all duration-300"
      )}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center">
          <div className="ml-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              POLL RESULTS
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white">{poll?.question}</h2>

        <div className="space-y-3 mt-6">
          {poll?.options.map((option: string, index: number) => (
            <button
              key={option}
              className={cn(
                "w-full relative rounded-full overflow-hidden h-12 flex items-center transition-all duration-200",
                selectedOption === option 
                  ? "bg-green-500" 
                  : "bg-gray-700"
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
                    selectedOption === option ? "text-white" : "text-gray-400"
                  )}
                >
                  {selectedOption === option ? "✓" : ""}
                </span>
                <span className="font-medium text-white z-10">{option}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center">
            <span className="ml-2 text-sm text-gray-400">0 People voted</span>
          </div>

          <div className="flex items-center text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">Poll Active</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="relative">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Reaction
            </Button>
          </div>

          <div className="relative">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
