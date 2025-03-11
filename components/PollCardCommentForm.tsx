import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios for HTTP requests

interface PollCardCommentFormProps {
  pollId: string; // Assuming pollId is passed as a prop to identify the poll
  onCommentAdded?: () => void; // Optional callback to notify parent of comment addition
}

const PollCardCommentForm: React.FC<PollCardCommentFormProps> = ({ pollId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (commentText.trim() === "") {
      console.log("Comment cannot be empty");
      setHasError(true);  // set error state
      return;
    }

    setHasError(false); //reset error on new submission
    setIsLoading(true);

    try {
      const response = await axios.patch(`https://vanish-vote-murex.vercel.app/api/v1/poll/${pollId}/comment`, {  //Template literal for the link
        text: commentText,
      });

      console.log("Comment added successfully:", response.data);
      setCommentText(""); // Clear the textarea
      onCommentAdded?.(); // Notify parent component if a callback is provided

    } catch (error: any) { //use error:any for typescript
      console.error("Error adding comment:", error.response?.data || error.message); //log more detailed error.
      setHasError(true);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasError) {
      const timer = setTimeout(() => {
        setHasError(false);
      }, 3000);

      return () => clearTimeout(timer);  // clear timeout on unmount or if hasError changes.
    }
  }, [hasError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div>
        <textarea
          className={`w-full p-2 border-2 ${hasError ? 'border-red-500' : 'border-white'} bg-transparent text-white placeholder-white rounded-md`}
          value={commentText}
          onChange={handleCommentChange}
          placeholder="Add a comment"
          rows={4}
          disabled={isLoading}
        />
        {hasError && (
          <p className="text-red-500 text-sm">Comment cannot be empty.</p>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md w-full"
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Comment"}
      </button>
    </form>
  );
};

export default PollCardCommentForm;