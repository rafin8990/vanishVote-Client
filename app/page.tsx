import PollCard from '@/components/PollCard';
import { Button } from '@/components/ui/button';
import { polls } from '@/lib/data';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Polls</h1>
          <Link href="/create">
            <Button className="bg-green-500 hover:bg-green-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </Link>
        </div>

        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </main>
  );
}
