import { useListTasks, useUpdateTask } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckSquare, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export default function Tasks() {
  const { data: tasks, refetch } = useListTasks();
  const updateTask = useUpdateTask();

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateTask.mutateAsync({ id, data: { status } });
      toast.success("Task updated");
      refetch();
    } catch (e) {
      toast.error("Failed to update task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700 hover:bg-red-100";
      case "high": return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "medium": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      default: return "bg-green-100 text-green-700 hover:bg-green-100";
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage your work and team assignments.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {COLUMNS.map((col) => {
            const columnTasks = tasks?.filter(t => t.status === col.id) || [];
            
            return (
              <div key={col.id} className="flex flex-col w-80 shrink-0 bg-muted/30 rounded-lg border border-border">
                <div className="p-3 border-b flex justify-between items-center bg-muted/50 rounded-t-lg">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    {col.label}
                  </h3>
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {columnTasks.map((task) => (
                    <Card key={task.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="font-medium text-sm leading-tight">{task.title}</div>
                        </div>
                        
                        {task.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${getPriorityColor(task.priority)} border-0`}>
                            {task.priority}
                          </Badge>
                          
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-muted-foreground border rounded-full px-2">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(task.dueDate), "MMM d")}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t">
                          <span className="text-xs font-medium truncate max-w-[150px]">
                            {task.assigneeName || "Unassigned"}
                          </span>
                          <select 
                            className="text-[10px] p-1 rounded border bg-background"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          >
                            {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center p-4 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}