import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Calendar } from "../../components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Heart,
  Brain,
  Activity,
  Smile,
  Frown,
  Meh,
  Star,
  Edit3,
  Trash2,
  Download,
  Share,
  Lock,
  Eye,
  EyeOff,
  Tag,
  Bookmark,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Award,
  Users,
  MessageCircle,
  FileText,
  Image,
  Mic,
  Video,
  Save,
  Settings
} from "lucide-react";

export function Journaling() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [entryText, setEntryText] = useState("");
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [entryTags, setEntryTags] = useState<string[]>([]);

  const journalEntries = [
    {
      id: "1",
      date: "2024-01-15",
      title: "Feeling much better today",
      content: "Started the new medication three days ago. Side effects are minimal and I'm sleeping better. Energy levels are improving gradually.",
      mood: 4,
      tags: ["medication", "sleep", "energy"],
      privacy: "private",
      wordCount: 84,
      timestamp: "9:30 AM"
    },
    {
      id: "2",
      date: "2024-01-14",
      title: "Challenging day at work",
      content: "Work stress is affecting my appetite. Need to discuss stress management techniques with Dr. Johnson during next visit.",
      mood: 2,
      tags: ["stress", "work", "appetite"],
      privacy: "shared_with_provider",
      wordCount: 72,
      timestamp: "6:45 PM"
    },
    {
      id: "3",
      date: "2024-01-13",
      title: "Morning exercise routine",
      content: "Completed a 30-minute walk in the park. Feeling motivated to continue daily exercise. Heart rate stayed within target zone.",
      mood: 5,
      tags: ["exercise", "heart-rate", "motivation"],
      privacy: "private",
      wordCount: 98,
      timestamp: "7:15 AM"
    },
    {
      id: "4",
      date: "2024-01-12",
      title: "Doctor appointment follow-up",
      content: "Had a productive conversation with Dr. Johnson about treatment options. Feel more informed and confident about the treatment plan.",
      mood: 4,
      tags: ["appointment", "treatment", "confidence"],
      privacy: "shared_with_provider",
      wordCount: 106,
      timestamp: "2:20 PM"
    },
    {
      id: "5",
      date: "2024-01-11",
      title: "Family dinner",
      content: "Enjoyed a wonderful family dinner. Grateful for their support during this health journey. Reminded me of what's truly important.",
      mood: 5,
      tags: ["family", "support", "gratitude"],
      privacy: "private",
      wordCount: 89,
      timestamp: "7:30 PM"
    }
  ];

  const moodEmojis = [
    { value: 1, emoji: "😢", label: "Very Low", color: "text-red-500" },
    { value: 2, emoji: "😕", label: "Low", color: "text-orange-500" },
    { value: 3, emoji: "😐", label: "Neutral", color: "text-yellow-500" },
    { value: 4, emoji: "😊", label: "Good", color: "text-green-500" },
    { value: 5, emoji: "😄", label: "Excellent", color: "text-emerald-500" }
  ];

  const commonTags = [
    "medication", "sleep", "energy", "stress", "exercise", "mood", "anxiety",
    "pain", "appetite", "social", "work", "family", "treatment", "symptoms"
  ];

  const privacyLevels = [
    { value: "private", label: "Private", icon: Lock, description: "Only you can see this" },
    { value: "shared_with_provider", label: "Share with Provider", icon: Users, description: "Visible to your care team" },
    { value: "shared_with_family", label: "Share with Family", icon: Heart, description: "Visible to designated family members" }
  ];

  const getMoodColor = (mood: number) => {
    const moodData = moodEmojis.find(m => m.value === mood);
    return moodData?.color || "text-gray-500";
  };

  const getMoodEmoji = (mood: number) => {
    const moodData = moodEmojis.find(m => m.value === mood);
    return moodData?.emoji || "😐";
  };

  const saveEntry = () => {
    if (entryText.trim()) {
      // Handle saving entry
      console.log("Saving entry:", {
        text: entryText,
        mood: moodRating,
        tags: entryTags,
        date: selectedDate
      });
      setEntryText("");
      setMoodRating(null);
      setEntryTags([]);
    }
  };

  const calculateStreakDays = () => {
    // Calculate consecutive days with entries
    return 7; // Mock data
  };

  const getWeeklyMoodAverage = () => {
    const moodValues = journalEntries.slice(0, 7).map(entry => entry.mood);
    const average = moodValues.reduce((sum, mood) => sum + mood, 0) / moodValues.length;
    return average.toFixed(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Health Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your health journey, mood, and wellness insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">
            <Bookmark className="w-4 h-4 mr-1" />
            {calculateStreakDays()}-day streak
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {journalEntries.length}
            </div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {getWeeklyMoodAverage()}
            </div>
            <div className="text-sm text-gray-600">Avg Weekly Mood</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateStreakDays()}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              92%
            </div>
            <div className="text-sm text-gray-600">Positive Entries</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and New Entry */}
        <div className="lg:col-span-1 space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Journal Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Quick Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Quick Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">How are you feeling today?</label>
                <div className="flex justify-between">
                  {moodEmojis.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setMoodRating(mood.value)}
                      className={`text-2xl p-2 rounded-lg transition-colors ${
                        moodRating === mood.value 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Journal Entry</label>
                <Textarea
                  placeholder="How was your day? What's on your mind?"
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {commonTags.slice(0, 6).map(tag => (
                    <Badge
                      key={tag}
                      variant={entryTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (entryTags.includes(tag)) {
                          setEntryTags(entryTags.filter(t => t !== tag));
                        } else {
                          setEntryTags([...entryTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={saveEntry} 
                className="w-full"
                disabled={!entryText.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Journal Entries */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Entries
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Search entries..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalEntries.map(entry => (
                  <div
                    key={entry.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedEntry === entry.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {entry.title}
                          </h4>
                          <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          <Badge variant="outline" className="text-xs">
                            {entry.privacy === 'private' ? (
                              <><Lock className="w-3 h-3 mr-1" /> Private</>
                            ) : entry.privacy === 'shared_with_provider' ? (
                              <><Users className="w-3 h-3 mr-1" /> Shared</>
                            ) : (
                              <><Heart className="w-3 h-3 mr-1" /> Family</>
                            )}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                          {entry.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {entry.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {entry.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {entry.wordCount} words
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedEntry === entry.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {entry.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold mb-2">Mood Trends</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span className="text-green-600">↗ Improving</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold mb-2">Most Common Tags</h4>
              <div className="flex flex-wrap justify-center gap-1">
                {['medication', 'sleep', 'exercise', 'mood'].map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold mb-2">Writing Consistency</h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">87%</div>
              <div className="text-sm text-gray-600">Days with entries this month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
