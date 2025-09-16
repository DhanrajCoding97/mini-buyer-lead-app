"use client"

import { useRouter } from "next/navigation"
import { BuyerForm } from "@/components/buyerForm"
import { createBuyer } from "@/app/actions/buyers"
import { useState } from "react"
import { toast } from "sonner"; 
import type { NewBuyerFormValues } from "@/lib/validations/buyer"

export default function NewBuyerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // async function onSubmit(values: NewBuyerFormValues) {
  //   setIsSubmitting(true)
  //   console.log("Values:", values)
  //   // Convert form data to FormData for server action
  //   const formData = new FormData()
  //   Object.entries(values).forEach(([key, value]) => {
  //     if (value !== undefined && value !== "" && value !== null) {
  //       if (key === "budgetMin" || key === "budgetMax") {
  //         formData.append(key, value.toString())
  //       } else {
  //         formData.append(key, value as string)
  //       }
  //     }
  //   })

  //   try {
  //     const result = await createBuyer(null, formData)
      
  //     if (result?.errors) {
  //       // Handle errors - you might want to pass these back to the form
  //       console.error("Form errors:", result.errors)
  //     } else if (result?.success) {
  //       router.push("/buyers")
  //     } else if (result?.error) {
  //       console.error("Server error:", result.error)
  //     }
  //   } catch (error) {
  //     console.error("Something went wrong:", error)
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }
  async function onSubmit(values: NewBuyerFormValues) {
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (key === "budgetMin" || key === "budgetMax") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value as string);
        }
      }
    });

    try {
      const result = await createBuyer(null, formData);

      if (result?.errors) {
        toast.error("Please fix the highlighted errors");
        console.error("Form errors:", result.errors);
      } else if (result?.success) {
        toast.success("Buyer created successfully 🎉");
        router.push("/buyers");
      } else if (result?.error) {
        toast.error(result.error || "Something went wrong");
        console.error("Server error:", result.error);
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
      console.error("Something went wrong:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BuyerForm
      mode="new"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  )
}