import { useListGoals, useListReviews } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Star, Calendar, CheckCircle, Award, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316"];

export default function Performance() {
  const { data: goals } = useListGoals();
  const { data: reviews } = useListReviews();

  // Analytics derivation
  const goalsByStatus = goals ? Object.values(goals.reduce((acc: any, goal) => {
    const status = goal.status || "active";
    if (!acc[status]) acc[status] = { name: status, count: 0 };
    acc[status].count += 1;
    return acc;
  }, {})) : [];

  const reviewsByRating = reviews ? Object.values(reviews.reduce((acc: any, review) => {
    const rating = String(review.rating);
    if (!acc[rating]) acc[rating] = { name: `Rating ${rating}`, count: 0, rating: review.rating };
    acc[rating].count += 1;
    return acc;
  }, {})).sort((a: any, b: any) => a.rating - b.rating) : [];

  const totalGoals = goals?.length || 0;
  const completedGoals = goals?.filter(g => g.status === "completed").length || 0;
  const reviewsCount = reviews?.length || 0;
  const avgRating = reviews && reviews.length > 0 ? reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance</h2>
          <p className="text-muted-foreground">Manage OKRs, goals, and performance reviews.</p>
        </div>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="goals">Goals & OKRs</TabsTrigger>
            <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <Button><Plus className="mr-2 h-4 w-4" /> Create</Button>
        </div>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-card">
                No goals found.
              </div>
            ) : (
              goals?.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold leading-none">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
                      </div>
                      <Badge variant="outline">{goal.type}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {goal.employeeName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {goal.targetDate ? format(new Date(goal.targetDate), "MMM d, yyyy") : "-"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No reviews found.
                  </div>
                ) : (
                  reviews?.map((review) => (
                    <div key={review.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{review.employeeName}</h4>
                          <Badge variant="secondary">{review.period}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reviewer: {review.reviewerName}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center text-yellow-500">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-current" : "opacity-30"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">{review.rating} / 5</span>
                        </div>
                        <Badge variant={review.status === "submitted" ? "default" : "outline"}>
                          {review.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGoals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews Count</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewsCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{avgRating.toFixed(1)} / 5</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Goals by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" className="capitalize" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews by Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reviewsByRating}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
