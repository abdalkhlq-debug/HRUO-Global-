import { useState } from "react";
import { useListJobs, useListApplicants, useUpdateApplicant } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, GripVertical, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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

                        {/* Dropdown to move for now instead of drag-drop for simplicity */}
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
    </div>
  );
}