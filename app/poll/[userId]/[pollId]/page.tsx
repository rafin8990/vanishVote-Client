"use client";

import PollCard from "@/components/PollCard";
import type { Poll } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Home() {
  const params = useParams();
  const userId = params.userId as string;
  const pollId = params.pollId as string;
  const [poll, setPoll] = useState<Poll | null>(null);


  useEffect(() => {
    fetch(`https://vanish-vote-murex.vercel.app/api/v1/poll/${userId}/${pollId}`)
      .then((res) => res.json())
      .then((data) => {
        setPoll(data.data);
      });
  }, [pollId, userId]);
  if (!poll) {
    return <div>No poll available</div>;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <PollCard poll={poll} />
      </div>
    </main>
  );
}
