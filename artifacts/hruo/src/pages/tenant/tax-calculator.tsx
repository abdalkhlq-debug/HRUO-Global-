import { useState } from "react";
import { useCalculateTax } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TaxCalculatorInputCountry, TaxCalculatorInputTerminationType } from "@workspace/api-client-react";

const taxSchema = z.object({
  grossSalary: z.coerce.number().min(1, "Gross salary must be greater than 0"),
  country: z.nativeEnum(TaxCalculatorInputCountry),
  yearsOfService: z.coerce.number().min(0).optional(),
  terminationType: z.nativeEnum(TaxCalculatorInputTerminationType).optional(),
});

type TaxFormValues = z.infer<typeof taxSchema>;

export default function TaxCalculator() {
  const [result, setResult] = useState<any>(null);
  const calculateTax = useCalculateTax();

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      grossSalary: 5000,
      country: TaxCalculatorInputCountry.egypt,
      yearsOfService: 0,
      terminationType: undefined,
    },
  });

  const onSubmit = async (values: TaxFormValues) => {
    try {
      const res = await calculateTax.mutateAsync({ data: values });
      setResult(res);
      toast.success("Tax calculated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to calculate tax");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tax Calculator</h2>
        <p className="text-muted-foreground">Multi-country payroll tax and end-of-service calculator.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> Calculator Inputs
            </CardTitle>
            <CardDescription>Enter details to calculate net salary and deductions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country/Region</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="egypt">Egypt</SelectItem>
                          <SelectItem value="tunisia">Tunisia</SelectItem>
                          <SelectItem value="morocco">Morocco</SelectItem>
                          <SelectItem value="gcc">GCC</SelectItem>
                          <SelectItem value="usa">USA</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grossSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Gross Salary</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type="number" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="yearsOfService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Service</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terminationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termination Type (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (Regular Payroll)</SelectItem>
                            <SelectItem value="resignation">Resignation</SelectItem>
                            <SelectItem value="dismissal">Dismissal</SelectItem>
                            <SelectItem value="retirement">Retirement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={calculateTax.isPending}>
                  {calculateTax.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Calculate
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results Breakdown</CardTitle>
            <CardDescription>Tax estimations based on regional rates.</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Gross Salary</p>
                    <p className="text-2xl font-bold">{result.grossSalary.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-primary/10 text-primary rounded-lg border border-primary/20">
                    <p className="text-sm font-medium mb-1">Net Salary</p>
                    <p className="text-2xl font-bold">{result.netSalary.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Deductions</h4>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Income Tax {result.incomeTaxRate ? `(${(result.incomeTaxRate * 100).toFixed(1)}%)` : ""}</span>
                    <span className="font-medium text-destructive">-{result.incomeTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>Social Insurance {result.socialInsuranceRate ? `(${(result.socialInsuranceRate * 100).toFixed(1)}%)` : ""}</span>
                    <span className="font-medium text-destructive">-{result.socialInsurance.toLocaleString()}</span>
                  </div>
                  
                  {result.endOfServiceBonus > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">End of Service Bonus</span>
                      <span className="font-medium text-green-600">+{result.endOfServiceBonus.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {result.breakdown && result.breakdown.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Detailed Brackets</h4>
                    {result.breakdown.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span>{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded text-center">
                  Values are estimates based on standard regional brackets. Actual amounts may vary based on specific individual circumstances.
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg bg-muted/10">
                <Calculator className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No calculation yet</p>
                <p className="text-sm text-muted-foreground mt-1">Enter your details and click calculate to see the breakdown.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}