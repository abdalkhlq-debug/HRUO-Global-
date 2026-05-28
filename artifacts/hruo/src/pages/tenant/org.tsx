import { useListDepartments, useListBranches } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Network, Building2, Plus, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Org() {
  const { data: departments } = useListDepartments();
  const { data: branches } = useListBranches();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
          <p className="text-muted-foreground">Manage departments, branches, and organizational structure.</p>
        </div>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
          </TabsList>
          <Button><Plus className="mr-2 h-4 w-4" /> Create New</Button>
        </div>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments?.map((dept) => (
              <Card key={dept.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-primary" />
                        {dept.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">{dept.code}</p>
                    </div>
                    <Badge variant={dept.active ? "default" : "secondary"}>
                      {dept.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {dept.employeeCount || 0} employees
                    </div>
                    <div className="font-medium">
                      Head: {dept.headName || "Unassigned"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {departments?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card">
                No departments found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches?.map((branch) => (
              <Card key={branch.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        {branch.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">{branch.code}</p>
                    </div>
                    <Badge variant={branch.active ? "default" : "secondary"}>
                      {branch.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{branch.address || "No address specified"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-3 border-t">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {branch.employeeCount || 0} employees
                      </div>
                      <Badge variant="outline">{branch.timezone || "UTC"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {branches?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-card">
                No branches found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}