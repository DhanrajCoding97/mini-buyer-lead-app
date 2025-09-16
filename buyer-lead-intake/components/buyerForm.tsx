"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { buyerFormSchema, newBuyerFormSchema, type BuyerFormValues, type NewBuyerFormValues } from "@/lib/validations/buyer"
import { useRouter } from "next/navigation"

interface BuyerFormProps {
	mode: "new" | "edit"
	onSubmit: (values: BuyerFormValues | NewBuyerFormValues) => Promise<void>
	defaultValues?: Partial<BuyerFormValues>
	isSubmitting?: boolean
}

const createDefaultBuyerFormValues = (overrides?: Partial<BuyerFormValues>): BuyerFormValues => ({
	fullName: "",
	email: undefined,
	phone: "",
	city: "Chandigarh",
	propertyType: "Apartment", 
	bhk: undefined,
	purpose: "Buy",
	timeline: "0-3m",
	source: "Website",
	budgetMin: undefined,
	budgetMax: undefined,
	notes: "",
	tags: [],
	status: "New",
	id: "",
	updatedAt: undefined,
	...overrides,
});
export function BuyerForm({
  mode,
  onSubmit,
  defaultValues,
  isSubmitting,
	}: BuyerFormProps) {
  const schema = mode === "new" ? newBuyerFormSchema : buyerFormSchema
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: createDefaultBuyerFormValues(defaultValues),
  })

  const [tagsInput, setTagsInput] = useState("")

  const handleSubmit = async (
    values: BuyerFormValues | NewBuyerFormValues
  ): Promise<void> => {
    await onSubmit(values);
  };

  const router = useRouter()

  const propertyTypeValue = form.watch("propertyType")
  const needsBhk = ["Apartment", "Villa"].includes(propertyTypeValue || "")

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl text-center font-bold text-black mb-6">
        {mode === "new" ? "New Lead Form" : "Edit Lead"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.log("Form validation errors:", errors);
        })} className="bg-white/80 border border-black/20 shadow-lg rounded-lg p-6 flex flex-col gap-2">
          {form.formState.errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {form.formState.errors.root.message}
            </div>
          )}

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">
                  Full Name <span className="text-red-800">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                 <div className="min-h-[1.2rem]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="min-w-0"> 
                  <FormLabel className="text-black">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} value={field.value || ""} className="w-full" />
                  </FormControl>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">
                    Phone <span className="text-red-800">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} className="w-full" />
                  </FormControl>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">
                    City <span className="text-red-800">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                      <SelectItem value="Mohali">Mohali</SelectItem>
                      <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                      <SelectItem value="Panchkula">Panchkula</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">
                    Source <span className="text-red-800">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">
                    Property Type <span className="text-red-800">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bhk"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">
                    BHK {needsBhk && <span className="text-red-800">*</span>}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select BHK" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4 BHK</SelectItem>
                    </SelectContent>
                  </Select>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">
                    Purpose <span className="text-red-800">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">
                    Timeline <span className="text-red-800">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Timeline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0-3m">0-3 months</SelectItem>
                      <SelectItem value="3-6m">3-6 months</SelectItem>
                      <SelectItem value=">6m">&gt;6 months</SelectItem>
                      <SelectItem value="Exploring">Exploring</SelectItem>
                    </SelectContent>
                  </Select>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="budgetMin"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">Min Budget (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="500000"
                      {...field}
                    	value={field.value ?? ""} 
                    	onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                    	}}
                    	className="w-full"
                    />
                  </FormControl>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetMax"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel className="text-black">Max Budget (₹)</FormLabel>
                  <FormControl>
                    <Input
  										type="number"
  										placeholder="500000"
  										{...field}
  										value={field.value ?? ""}  
  										onChange={(e) => {
  										  const value = e.target.value;
  										  field.onChange(value === "" ? undefined : Number(value));
  										}}
  										className="w-full"
										/>
                  </FormControl>
                   <div className="min-h-[1.2rem]">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional notes..." {...field} value={field.value ?? ""} />
                </FormControl>
                 <div className="min-h-[1.2rem]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input 
										placeholder="urgent, vip, callback" 
										value={tagsInput || field.value?.join(", ") || ""}
										onChange={(e) => {
											const value = e.target.value;
											setTagsInput(value);
										}}
										onBlur={(e) => {
											const value = e.target.value;
											const tagsArray = value
												.split(",")
												.map(tag => tag.trim())
												.filter(tag => tag.length > 0);
											field.onChange(tagsArray);
											setTagsInput(""); // Clear the input state
										}}
									/>
                </FormControl>
                 <div className="min-h-[1.2rem]">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
					<div className="flex items-center justify-center gap-5">
          	<Button className="max-w-[200px]" type="submit" disabled={isSubmitting}>
              {isSubmitting 
    						? (mode === "new" ? "Creating..." : "Updating...")
    						: (mode === "new" ? "Create Lead" : "Update Lead")
  						}
           	</Button>
            <Button type="button" variant="link" className="max-w-[200p]" onClick={() => router.push("/buyers")}>
              Go Back
          	</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
