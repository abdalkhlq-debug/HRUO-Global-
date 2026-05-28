import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateQuoteRequest } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const MODULES = [
  { id: "Employees", label: "Core HR & Employees" },
  { id: "Payroll", label: "Payroll Processing" },
  { id: "Attendance", label: "Time & Attendance" },
  { id: "Leave", label: "Leave Management" },
  { id: "Recruitment", label: "Recruitment & ATS" },
  { id: "Expenses", label: "Expense Claims" },
  { id: "Performance", label: "Performance & Goals" },
  { id: "Training", label: "Training & Courses" },
  { id: "Documents", label: "Document Management" },
  { id: "Tasks", label: "Task Management" },
];

const quoteSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  employeeCount: z.coerce.number().min(1, "Must have at least 1 employee"),
  modules: z.array(z.string()).min(1, "Select at least one module"),
  message: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export default function RequestQuote() {
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const createQuote = useCreateQuoteRequest();
  
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      employeeCount: 50,
      modules: ["Employees"],
      message: "",
    },
  });

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      await createQuote.mutateAsync({ data: values });
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/hruo-logo.png" alt="HRUO Logo" className="h-8" />
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-background border rounded-lg p-8 text-center space-y-6 shadow-sm">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Request Received</h2>
              <p className="text-muted-foreground">
                Thank you for your interest in HRUO. Our enterprise sales team will review your requirements and contact you shortly.
              </p>
            </div>
            <Button onClick={() => setLocation("/")} className="w-full">
              Return to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="h-16 border-b bg-background flex items-center px-4 md:px-6 sticky top-0 z-10">
        <div className="flex-1">
          <Link href="/">
            <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <img src="/hruo-logo.png" alt="HRUO Logo" className="h-8" />
        </div>
        <div className="flex-1" />
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Request a Quote</h1>
            <p className="text-muted-foreground">
              Tell us about your organization and requirements. We'll tailor a custom enterprise package for you.
            </p>
          </div>

          <div className="bg-background border rounded-lg p-6 md:p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jane@acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-8">
                  <FormField
                    control={form.control}
                    name="modules"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Modules of Interest</FormLabel>
                          <FormDescription>
                            Select the features your organization needs.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {MODULES.map((module) => (
                            <FormField
                              key={module.id}
                              control={form.control}
                              name="modules"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={module.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(module.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, module.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== module.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {module.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-8">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about any specific integrations, compliance needs, or timelines..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" disabled={createQuote.isPending} className="w-full md:w-auto px-8">
                    {createQuote.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Submit Request
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}