"use client"

import { useRouter } from "next/navigation"
import { BuyerForm } from "@/components/buyerForm"
import { createBuyer } from "@/app/actions/buyers"
import { useState } from "react"
import { toast } from "sonner"; 
import type { NewBuyerFormValues } from "@/lib/validations/buyer"

// --- Type guards for CreateBuyerState ---
function isErrorResult(
  result: Awaited<ReturnType<typeof createBuyer>>
): result is { errors: Record<string, string> } {
  return !!result && "errors" in result
}

function isSuccessResult(
  result: Awaited<ReturnType<typeof createBuyer>>
): result is { success: true; buyerId: string } {
  return !!result && "success" in result
}

function isServerError(
  result: Awaited<ReturnType<typeof createBuyer>>
): result is { error: string } {
  return !!result && "error" in result
}

export default function NewBuyerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function onSubmit(values: NewBuyerFormValues) {
    setIsSubmitting(true)

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (key === "budgetMin" || key === "budgetMax") {
          formData.append(key, value.toString())
        } else {
          formData.append(key, value as string)
        }
      }
    })

    try {
      const result = await createBuyer(null, formData)

      if (isErrorResult(result)) {
        toast.error("Please fix the highlighted errors")
        console.error("Form errors:", result.errors)
      } else if (isSuccessResult(result)) {
        toast.success("Buyer created successfully 🎉")
        router.push("/buyers")
      } else if (isServerError(result)) {
        toast.error(result.error || "Something went wrong")
        console.error("Server error:", result.error)
      }
    } catch (error) {
      toast.error("Unexpected error occurred")
      console.error("Something went wrong:", error)
    } finally {
      setIsSubmitting(false)
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