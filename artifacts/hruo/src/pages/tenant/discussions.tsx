import { useListDiscussions, useCreateDiscussion } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Plus, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function Discussions() {
  const { data: discussions } = useListDiscussions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discussions</h2>
          <p className="text-muted-foreground">Internal company forums and topics.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Topic</Button>
      </div>

      <div className="grid gap-4">
        {discussions?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            No discussions found. Start a new topic!
          </div>
        ) : (
          discussions?.map((discussion) => (
            <Card key={discussion.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {discussion.authorName?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{discussion.title}</h3>
                      <Badge variant="outline" className="capitalize">{discussion.scope}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {discussion.content}
                    </p>
                    <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {discussion.authorName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {discussion.createdAt ? formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true }) : "Unknown"}
                      </div>
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {discussion.replyCount || 0} replies
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}