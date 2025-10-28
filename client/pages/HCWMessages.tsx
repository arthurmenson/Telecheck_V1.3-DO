import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Paperclip,
  Search,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  useHcwMessageThreads,
  useHcwMessages,
  useMarkHcwMessageRead,
  useSendHcwMessage,
  useUserProfile,
} from "@/hooks/api";
import type { ApiError } from "@/lib/api-client";
import type { HcwMessage, HcwThread } from "@/services/api.service";

export default function HCWMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(
    searchParams.get("caregiver"),
  );
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const threadsQuery = useHcwMessageThreads();
  const messagesQuery = useHcwMessages(selectedCaregiver);
  const sendMessageMutation = useSendHcwMessage();
  const markMessageReadMutation = useMarkHcwMessageRead();
  const { data: currentUser } = useUserProfile();

  const markedMessagesRef = useRef<Set<string>>(new Set());

  const threads: HcwThread[] = threadsQuery.data ?? [];
  const messages: HcwMessage[] = messagesQuery.data ?? [];

  useEffect(() => {
    const error = threadsQuery.error as ApiError | undefined;
    if (error?.status === 401) {
      navigate("/login");
      return;
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to load messages.",
        variant: "destructive",
      });
    }
  }, [threadsQuery.error, navigate, toast]);

  useEffect(() => {
    const error = messagesQuery.error as ApiError | undefined;
    if (error && error.status !== 401) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to load conversation.",
        variant: "destructive",
      });
    }
  }, [messagesQuery.error, toast]);

  useEffect(() => {
    if (!messages?.length || !currentUser?.id || !selectedCaregiver) {
      return;
    }

    messages
      .filter(
        (message) => message.recipientId === currentUser.id && !message.isRead,
      )
      .forEach((message) => {
        if (!markedMessagesRef.current.has(message.id)) {
          markedMessagesRef.current.add(message.id);
          markMessageReadMutation.mutate({
            messageId: message.id,
            caregiverId: selectedCaregiver,
          });
        }
      });
  }, [messages, currentUser?.id, selectedCaregiver, markMessageReadMutation]);

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) {
      return threads;
    }
    const normalized = searchQuery.trim().toLowerCase();
    return threads.filter((thread) =>
      `${thread.caregiverName} ${thread.caregiverSpecialty}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [threads, searchQuery]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.caregiverId === selectedCaregiver),
    [threads, selectedCaregiver],
  );

  useEffect(() => {
    markedMessagesRef.current.clear();
  }, [selectedCaregiver]);

  const handleSelectThread = (caregiverId: string) => {
    setSelectedCaregiver(caregiverId);
  };

  const handleSendMessage = async () => {
    if (!selectedCaregiver || !newMessage.trim()) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        recipientId: selectedCaregiver,
        content: newMessage.trim(),
      });
      setNewMessage("");
      markedMessagesRef.current.clear();
      toast({
        title: "Message sent",
        description: "Your message was delivered to the care team.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const isLoadingThreads = threadsQuery.isLoading;
  const isLoadingMessages =
    messagesQuery.isLoading ||
    (messagesQuery.isFetching && !!selectedCaregiver);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-10">
            <Button
              variant="ghost"
              className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/my-care-team")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to care team
            </Button>
            <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-none">
              <CardHeader className="px-0">
                <Badge
                  variant="outline"
                  className="w-fit mb-4 uppercase tracking-wide"
                >
                  Care Team Messaging
                </Badge>
                <CardTitle className="text-3xl font-semibold tracking-tight">
                  Message your HCW@Home care team
                </CardTitle>
                <p className="text-muted-foreground max-w-2xl">
                  Secure messaging with your assigned caregivers for quick
                  questions, follow-ups, and visit preparation.
                </p>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[340px,1fr] gap-6">
          <Card className="border-muted/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Your Care Team
                </CardTitle>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {threads.length} members
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search caregivers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <ScrollArea className="h-[calc(100vh-340px)] pr-3">
                {isLoadingThreads ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
                    <MessageCircle className="w-10 h-10 mb-3" />
                    <p>No care team members found</p>
                    <p className="text-sm">
                      Your assigned caregivers will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredThreads.map((thread) => (
                      <button
                        key={thread.caregiverId}
                        onClick={() => handleSelectThread(thread.caregiverId)}
                        className={`w-full text-left rounded-xl border transition-colors ${selectedCaregiver === thread.caregiverId ? "border-primary/20 bg-primary/5" : "border-transparent hover:bg-muted/80"}`}
                      >
                        <div className="flex gap-3 p-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {thread.caregiverName
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold leading-tight">
                                  {thread.caregiverName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {thread.caregiverSpecialty}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(
                                  new Date(thread.lastMessageTime),
                                  { addSuffix: true },
                                )}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {thread.lastMessage}
                            </p>
                          </div>
                        </div>
                        {thread.unreadCount > 0 && (
                          <div className="px-4 pb-3">
                            <Badge className="rounded-full">
                              {thread.unreadCount} unread
                            </Badge>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-muted/60">
            {selectedCaregiver && selectedThread ? (
              <>
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage alt={selectedThread.caregiverName} />
                      <AvatarFallback className="text-lg">
                        {selectedThread.caregiverName
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {selectedThread.caregiverName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedThread.caregiverSpecialty}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100vh-350px)]">
                  <ScrollArea className="flex-1 p-6">
                    {isLoadingMessages ? (
                      <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <Skeleton
                            key={index}
                            className="h-16 w-3/4 rounded-lg"
                          />
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                        <MessageCircle className="w-12 h-12 mb-4" />
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm max-w-sm">
                          Send the first message to start a conversation with
                          your care team.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const fromCurrentUser =
                            currentUser?.id &&
                            message.senderId === currentUser.id;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${fromCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                                  fromCurrentUser
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-muted rounded-bl-none"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">
                                  {message.content}
                                </p>
                                <div
                                  className={`mt-2 flex items-center gap-2 text-xs ${fromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                                >
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(message.createdAt),
                                      {
                                        addSuffix: true,
                                      },
                                    )}
                                  </span>
                                  {fromCurrentUser && message.isRead && (
                                    <CheckCheck className="w-3 h-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="border-t bg-muted/30 p-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          sendMessageMutation.isPending || !newMessage.trim()
                        }
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center text-center h-full space-y-4 py-24 text-muted-foreground">
                <MessageCircle className="w-12 h-12 opacity-60" />
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Select a care team member to begin
                  </p>
                  <p className="text-sm">
                    Your conversation history and secure messages will appear
                    here.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
