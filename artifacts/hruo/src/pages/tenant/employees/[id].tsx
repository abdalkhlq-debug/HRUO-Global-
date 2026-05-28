import { useGetEmployee, useUpdateEmployee, getGetEmployeeQueryKey } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Building } from "lucide-react";
import { format } from "date-fns";

export default function EmployeeProfile() {
  const [, params] = useRoute("/employees/:id");
  const employeeId = params?.id ? parseInt(params.id) : 0;
  
  const { data: employee, isLoading } = useGetEmployee(employeeId, {
    query: {
      enabled: !!employeeId,
      queryKey: getGetEmployeeQueryKey(employeeId),
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!employee) return <div>Employee not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Employee Profile</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32">
                {employee.photo ? <AvatarImage src={employee.photo} /> : null}
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                  {employee.firstName[0]}{employee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold text-xl">{employee.firstName} {employee.lastName}</h3>
                <p className="text-sm text-muted-foreground">{employee.jobTitle || "No Title"}</p>
                <div className="pt-2">
                  <Badge variant={employee.status === "active" ? "default" : employee.status === "on_leave" ? "secondary" : "destructive"}>
                    {employee.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.departmentName && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.departmentName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">First Name</p>
                    <p>{employee.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                    <p>{employee.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="capitalize">{employee.gender || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
                    <p>{employee.birthDate ? format(new Date(employee.birthDate), "PPP") : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                    <p>{employee.nationality || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">National ID</p>
                    <p>{employee.nationalId || "-"}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="employment" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                    <p>{employee.employeeNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Title</p>
                    <p>{employee.jobTitle || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p>{employee.departmentName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Manager</p>
                    <p>{employee.managerName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date Joined</p>
                    <p>{employee.dateJoined ? format(new Date(employee.dateJoined), "PPP") : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employment Type</p>
                    <p className="capitalize">{employee.employmentType || "-"}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="financial" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Basic Salary</p>
                    <p>{employee.basicSalary ? `${employee.currency} ${employee.basicSalary.toLocaleString()}` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                    <p>{employee.bankName || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                    <p className="font-mono">{employee.iban || "-"}</p>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}