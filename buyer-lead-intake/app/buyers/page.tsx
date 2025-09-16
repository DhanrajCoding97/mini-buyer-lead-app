'use client'

import { Suspense } from "react"
import BuyersPageContent from "@/components/buyersPageContent"

// ✅ Wrap the whole page in Suspense
export default function BuyersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading buyers...</div>}>
      <BuyersPageContent />
    </Suspense>
  )
}
