import { useListCourses, useListTrainingRecords } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MapPin, Calendar, Users, Plus } from "lucide-react";
import { format } from "date-fns";

export default function Training() {
  const { data: courses } = useListCourses();
  const { data: records } = useListTrainingRecords();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Training</h2>
          <p className="text-muted-foreground">Manage corporate training and employee development.</p>
        </div>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="courses">Course Catalog</TabsTrigger>
            <TabsTrigger value="records">Training Records</TabsTrigger>
          </TabsList>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Course</Button>
        </div>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>{course.code}</CardDescription>
                    </div>
                    <Badge variant={course.active ? "default" : "secondary"}>
                      {course.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description || "No description provided."}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {course.trainerName && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{course.trainerName}</span>
                      </div>
                    )}
                    {course.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{course.location}</span>
                      </div>
                    )}
                    {(course.startDate || course.endDate) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {course.startDate ? format(new Date(course.startDate), "MMM d") : ""} - 
                          {course.endDate ? format(new Date(course.endDate), "MMM d, yyyy") : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Employee Training Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {records?.map((record) => (
                  <div key={record.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{record.employeeName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{record.courseName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground text-right hidden sm:block">
                        {record.startDate && format(new Date(record.startDate), "MMM d, yyyy")}
                      </div>
                      <Badge variant={record.status === "completed" ? "default" : record.status === "in_progress" ? "secondary" : "outline"}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
                {records?.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">No records found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}