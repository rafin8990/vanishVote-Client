'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { addDays, addHours, format } from 'date-fns';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [endTime, setEndTime] = useState('12:00');

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine date and time for the end time
    let pollEndTime = null;
    if (endDate) {
      const [hours, minutes] = endTime.split(':').map(Number);
      pollEndTime = new Date(endDate);
      pollEndTime.setHours(hours, minutes);
    }

    // Here you would typically send the data to your backend
    console.log({
      question,
      options: options.filter((opt) => opt.trim() !== ''),
      endTime: pollEndTime,
    });

    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setEndDate(addDays(new Date(), 1));
    setEndTime('12:00');
  };

  // Generate time options in 30-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  // Quick duration options
  const quickDurations = [
    { label: '1 hour', value: addHours(new Date(), 1) },
    { label: '24 hours', value: addHours(new Date(), 24) },
    { label: '3 days', value: addDays(new Date(), 3) },
    { label: '1 week', value: addDays(new Date(), 7) },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-900 p-6 rounded-lg max-w-6xl mx-auto"
    >
      <h2 className="text-xl font-bold text-white">Create a New Poll</h2>

      <div className="space-y-2">
        <label htmlFor="question" className="text-sm font-medium text-gray-300">
          Question
        </label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          required
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
              className="bg-gray-800 border-gray-700 text-white"
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

      <div className="space-y-2">
        <Label htmlFor="end-time" className="text-sm font-medium text-gray-300">
          Poll End Time
        </Label>

        <div className="flex flex-col space-y-2">
          <div className="flex flex-wrap gap-2">
            {quickDurations.map((duration, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEndDate(duration.value)}
                className={cn(
                  'text-gray-300 border-gray-700 hover:bg-gray-800',
                  endDate && endDate.getTime() === duration.value.getTime() && 'bg-gray-700',
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
                    'w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white',
                    !endDate && 'text-muted-foreground',
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Pick a date'}
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
        className="w-full bg-green-500 hover:bg-green-600 text-black font-medium"
      >
        Create Poll
      </Button>
    </form>
  );
}
