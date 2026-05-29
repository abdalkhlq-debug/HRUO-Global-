import { useState } from "react";
import { useListJobs, useListApplicants, useUpdateApplicant } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, GripVertical, Mail, Phone, Calendar, Briefcase, Users, UserCheck, LayoutPanelLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316"];

const STAGES = [
  { id: "applied", label: "Applied" },
  { id: "screening", label: "Screening" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
];

export default function Recruitment() {
  const { data: jobs } = useListJobs();
  const { data: applicants, refetch } = useListApplicants();
  const updateApplicant = useUpdateApplicant();
  
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const filteredApplicants = selectedJobId 
    ? applicants?.filter(a => a.jobId === selectedJobId) 
    : applicants;

  const handleStageChange = async (applicantId: number, newStage: string) => {
    try {
      await updateApplicant.mutateAsync({
        id: applicantId,
        data: { stage: newStage }
      });
      toast.success("Applicant stage updated");
      refetch();
    } catch (error) {
      toast.error("Failed to update stage");
    }
  };

  // Analytics derivation
  const applicantsPerStage = STAGES.map(stage => ({
    name: stage.label,
    count: applicants?.filter(a => a.stage === stage.id).length || 0
  }));

  const jobsByStatus = jobs ? Object.values(jobs.reduce((acc: any, job) => {
    const status = job.status || "open";
    if (!acc[status]) acc[status] = { name: status, value: 0 };
    acc[status].value += 1;
    return acc;
  }, {})) : [];

  const totalJobs = jobs?.length || 0;
  const openJobs = jobs?.filter(j => String(j.status) === "open").length || 0;
  const totalApplicants = applicants?.length || 0;
  const hiredCount = applicants?.filter(a => a.stage === "hired").length || 0;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recruitment Pipeline</h2>
          <p className="text-muted-foreground">Manage job postings and track applicants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> New Job</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Applicant</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col space-y-6 overflow-hidden">
        <TabsList className="shrink-0">
          <TabsTrigger value="overview">Pipeline Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 flex flex-col space-y-6 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
            <Button 
              variant={selectedJobId === null ? "default" : "outline"}
              onClick={() => setSelectedJobId(null)}
              className="whitespace-nowrap"
            >
              All Jobs
            </Button>
            {jobs?.map((job) => (
              <Button
                key={job.id}
                variant={selectedJobId === job.id ? "default" : "outline"}
                onClick={() => setSelectedJobId(job.id)}
                className="whitespace-nowrap"
              >
                {job.title}
                <Badge variant="secondary" className="ml-2 bg-background/20">{job.applicantCount}</Badge>
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max pb-4">
              {STAGES.map((stage) => {
                const stageApplicants = filteredApplicants?.filter(a => a.stage === stage.id) || [];
                
                return (
                  <div key={stage.id} className="flex flex-col w-80 shrink-0 bg-muted/30 rounded-lg border border-border">
                    <div className="p-3 border-b flex justify-between items-center bg-muted/50 rounded-t-lg">
                      <h3 className="font-semibold text-sm">{stage.label}</h3>
                      <Badge variant="secondary">{stageApplicants.length}</Badge>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto space-y-3">
                      {stageApplicants.map((applicant) => (
                        <Card key={applicant.id} className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-sm leading-tight">{applicant.name}</div>
                              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              {applicant.jobTitle}
                            </div>
                            
                            <div className="flex gap-2">
                              {applicant.email && (
                                <Button variant="ghost" size="icon" className="h-6 w-6" title={applicant.email}>
                                  <Mail className="h-3 w-3" />
                                </Button>
                              )}
                              {applicant.phone && (
                                <Button variant="ghost" size="icon" className="h-6 w-6" title={applicant.phone}>
                                  <Phone className="h-3 w-3" />
                                </Button>
                              )}
                              {applicant.appliedAt && (
                                <div className="flex items-center text-xs text-muted-foreground ml-auto" title="Applied date">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {format(new Date(applicant.appliedAt), "MMM d")}
                                </div>
                              )}
                            </div>

                            <select 
                              className="w-full text-xs p-1 rounded border mt-2"
                              value={applicant.stage}
                              onChange={(e) => handleStageChange(applicant.id, e.target.value)}
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </CardContent>
                        </Card>
                      ))}
                      {stageApplicants.length === 0 && (
                        <div className="text-center p-4 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                          No applicants in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 overflow-y-auto pr-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
                <LayoutPanelLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openJobs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApplicants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hired</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hiredCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Applicants per Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={applicantsPerStage}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
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
                <CardTitle>Jobs by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {jobsByStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
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
