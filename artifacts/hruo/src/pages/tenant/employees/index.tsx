import { useState } from "react";
import { useListEmployees } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Search, MoreHorizontal, FileEdit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EmployeesList() {
  const [search, setSearch] = useState("");
  const { data: employees, isLoading } = useListEmployees();

  const filteredEmployees = employees?.filter(emp => 
    emp.firstName.toLowerCase().includes(search.toLowerCase()) || 
    emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage your workforce, departments, and roles.</p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredEmployees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No employees found.</TableCell>
              </TableRow>
            ) : (
              filteredEmployees?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {employee.photo ? <AvatarImage src={employee.photo} /> : null}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{employee.firstName} {employee.lastName}</span>
                        <span className="text-xs text-muted-foreground">{employee.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{employee.employeeNumber}</TableCell>
                  <TableCell>{employee.departmentName || "-"}</TableCell>
                  <TableCell>{employee.jobTitle || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "active" ? "default" : employee.status === "on_leave" ? "secondary" : "destructive"}>
                      {employee.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee.id}`} className="flex items-center cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <FileEdit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}