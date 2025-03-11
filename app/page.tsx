"use client";
import type React from "react";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import cookies from "js-cookie";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { addDays, addHours, format } from "date-fns";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatePollForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endDate, setEndDate] = useState<Date | undefined>(
    addDays(new Date(), 1)
  );
  const [endTime, setEndTime] = useState("12:00");
  const [questionType, setQuestionType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length < 5 && questionType === 0) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let pollEndTime = null;
    if (endDate) {
      const [hours, minutes] = endTime.split(":").map(Number);
      pollEndTime = new Date(endDate);
      pollEndTime.setHours(hours, minutes);
    }

    const pollData = {
      question,
      questionType,
      timeOut: pollEndTime,
      options:
        questionType === 1 ? [] : options.filter((opt) => opt.trim() !== ""),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/poll",
        pollData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        console.log("Poll created successfully:", response.data.data);
        const result = response.data.data;
        cookies.set("userID", result.uuid);
        const userID = cookies.get("userID");
        const pollID = result._id;
        alert("Poll created successfully");
        router.push(`/poll/${userID}/${pollID}`);
        setQuestion("");
        setOptions(["", ""]);
        setEndDate(addDays(new Date(), 1));
        setEndTime("12:00");
      }
    } catch (error) {
      setError("An error occurred while creating the poll. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const quickDurations = [
    { label: "1 hour", value: addHours(new Date(), 1) },
    { label: "24 hours", value: addHours(new Date(), 24) },
    { label: "3 days", value: addDays(new Date(), 3) },
    { label: "1 week", value: addDays(new Date(), 7) },
  ];

  return (
    <div className="bg-gray-800 min-h-screen lg:pt-10">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-900 p-8 rounded-lg max-w-2xl mx-auto  shadow-lg"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          Create a New Poll
        </h2>

        <div className="space-y-4">
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-300"
          >
            Question
          </label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            required
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Question Type:
          </label>
          <select
            className="block w-full p-2 bg-gray-800 border-gray-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setQuestionType(Number(e.target.value))}
            value={questionType}
          >
            <option value={0}>Multiple Options</option>
            <option value={1}>Yes/No</option>
          </select>
        </div>

        {questionType === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Options
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {options.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2 w-full text-gray-300 border-gray-700 hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>
        )}

        {/* End Time Section */}
        <div className="space-y-4">
          <Label
            htmlFor="end-time"
            className="block text-sm font-medium text-gray-300"
          >
            Poll End Time
          </Label>

          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-2">
              {quickDurations.map((duration, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEndDate(duration.value)}
                  className={cn(
                    "text-gray-300 border-gray-700 hover:bg-gray-800",
                    endDate &&
                      endDate.getTime() === duration.value.getTime() &&
                      "bg-gray-700"
                  )}
                >
                  {duration.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>

              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {generateTimeOptions().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Creating Poll..." : "Create Poll"}
        </Button>

        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}
