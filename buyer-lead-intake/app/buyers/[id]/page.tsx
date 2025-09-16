"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BuyerForm } from '@/components/buyerForm';
import { useRouter } from "next/navigation"
import { type BuyerFormValues, type NewBuyerFormValues } from "@/lib/validations/buyer";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Target,
  Clock,
  Globe,
  DollarSign,
  FileText,
  Tag,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react"
export default function BuyerPage({ params }: { params: Promise<{ id: string }> })  {
  const router = useRouter()
  const { id } = React.use(params)
  const [buyer, setBuyer] = useState<BuyerFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
	const [editMode, setEditMode] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-green-100 text-green-800 border-green-200"
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "qualified":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }
	useEffect(() => {
    const fetchBuyer = async () => {
      const res = await fetch(`/api/buyers/${id}`)
      if (res.ok) {
        const data = await res.json()
        setBuyer(data)
      }
      setLoading(false)
    }
    fetchBuyer()
  }, [id])

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!buyer) return <p className="text-center mt-6">Buyer not found</p>;

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this buyer?")) return;

		const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
		if (res.ok) {
				router.push("/buyers"); // go back to list
		}
	};

  async function handleSubmit(values: BuyerFormValues | NewBuyerFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
  
      if (!res.ok) {
        let errorMessage = "Something went wrong";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // if body isn't JSON, fallback
        }
        toast.error(errorMessage); // ✅ always show error toast
        return;
      }
  
      toast.success("Buyer updated successfully");
      router.push("/buyers");
    } catch (err) {
      console.error("Unexpected error occurred", err);
      toast.error("Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {editMode ? (
            <BuyerForm
              mode="edit"
              onSubmit={handleSubmit}
              defaultValues={buyer}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Information</h1>
              <p className="text-gray-600">Complete details and preferences</p>
            </div>
      
            <div className="grid gap-6">
              {/* Header Card with Name and Status */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{buyer.fullName}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Real Estate Inquiry</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(buyer.status || "")} font-medium`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {buyer.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
      
              {/* Contact Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-900">{buyer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-900">{buyer.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">City</p>
                      <p className="text-sm text-gray-900">{buyer.city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
      
              {/* Property Preferences */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="w-5 h-5 text-green-600" />
                    Property Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Home className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Property Type</p>
                        <p className="text-sm text-gray-900 font-semibold">{buyer.propertyType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Target className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">BHK</p>
                        <p className="text-sm text-gray-900 font-semibold">{buyer.bhk}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Target className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Purpose</p>
                        <p className="text-sm text-gray-900 font-semibold">{buyer.purpose}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
      
              {/* Timeline & Budget */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Timeline & Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Timeline</p>
                        <p className="text-sm text-gray-900 font-semibold">{buyer.timeline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Globe className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Source</p>
                        <p className="text-sm text-gray-900 font-semibold">{buyer.source}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
      
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      Budget Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget Min</p>
                        <p className="text-sm text-gray-900 font-semibold">{buyer.budgetMin || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget Max</p>
                        <p className="text-sm text-gray-900 font-semibold">{buyer.budgetMax || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
      
              {/* Additional Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                        <p className="text-sm text-gray-900">{buyer.notes || "No additional notes provided"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Tag className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {buyer.tags?.length ? (
                            buyer.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No tags assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
      
              {/* Action Buttons */}
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setEditMode(true)} className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Information
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Buyer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          )
        }
    </div>
  )
}
