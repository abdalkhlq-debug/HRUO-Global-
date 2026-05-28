import { useListAnnouncements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Megaphone, Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Announcements() {
  const { data: announcements } = useListAnnouncements();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">Company-wide news and updates.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Announcement</Button>
      </div>

      <div className="grid gap-6">
        {announcements?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            No announcements found.
          </div>
        ) : (
          announcements?.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {announcement.announcementDate ? format(new Date(announcement.announcementDate), "PPP") : "-"}
                        </span>
                        <span>By {announcement.authorName}</span>
                      </div>
                    </div>
                  </div>
                  {!announcement.published && (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {announcement.content}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}