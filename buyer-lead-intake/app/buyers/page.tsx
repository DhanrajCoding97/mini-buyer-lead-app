'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LogoutButton } from "@/components/logoutButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Phone, MapPin, Home, Calendar, DollarSign, Eye, Upload, Download, Loader2, ChevronDown, AlertCircle, Check } from "lucide-react"
import { toast } from "sonner"

type Buyer = {
  id: string
  fullName: string
  email?: string
  phone?: string
  city?: string
  propertyType?: string
  bhk?: number
  budgetMin?: number
  budgetMax?: number
  status: string
  timeline?: string
  updatedAt: string
}

type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export default function BuyersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 🔹 Initial values from URL
  const initialPage = Number(searchParams.get("page") || 1)
  const initialSearch = searchParams.get("search") || ""
  const initialCity = searchParams.get("city") || ""
  const initialPropertyType = searchParams.get("propertyType") || ""
  const initialStatus = searchParams.get("status") || ""
  const initialTimeline = searchParams.get("timeline") || ""
  const initialSort = searchParams.get("sort") || "updatedDesc"

  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [city, setCity] = useState(initialCity)
  const [propertyType, setPropertyType] = useState(initialPropertyType)
  const [status, setStatus] = useState(initialStatus)
  const [timeline, setTimeline] = useState(initialTimeline)
  const [sort, setSort] = useState(initialSort)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [timelines, setTimelines] = useState<string[]>([])
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  // Fetch filter options
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/buyers/filters")
        const data = await res.json()
        setCities(data.cities)
        setPropertyTypes(data.propertyTypes)
        setStatuses(data.statuses)
        setTimelines(data.timelines)
      } catch (error) {
        console.error("Failed to fetch filters:", error)
      }
    }
    fetchFilters()
  }, [])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(handler)
  }, [search])

  // Sync state → URL
  useEffect(() => {
    const params = new URLSearchParams()
    params.set("page", page.toString())
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (city) params.set("city", city)
    if (propertyType) params.set("propertyType", propertyType)
    if (status) params.set("status", status)
    if (timeline) params.set("timeline", timeline)
    if (sort) params.set("sort", sort)
    router.replace(`/buyers?${params.toString()}`)
  }, [page, debouncedSearch, city, propertyType, status, timeline, sort, router])

  // Fetch buyers function - extracted for reuse
  const fetchBuyers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
        search: debouncedSearch,
        city,
        propertyType,
        status,
        timeline,
        sort,
      })

      const res = await fetch(`/api/buyers?${params}`)
      const data = await res.json()
      setBuyers(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch buyers:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch buyers whenever filters/page/search/sort change
  useEffect(() => {
    fetchBuyers()
  }, [page, debouncedSearch, city, propertyType, status, timeline, sort])

  // Handle status update
  const handleStatusUpdate = async (buyerId: string, newStatus: string, currentUpdatedAt: string) => {
    setUpdatingStatus(buyerId)
    try {
      const response = await fetch(`/api/buyers/${buyerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updatedAt: currentUpdatedAt
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 429) {
          toast.error(`Rate limit exceeded. Try again in ${error.retryAfter} seconds.`)
          return
        }
        throw new Error(error.error || 'Failed to update status')
      }

      const updatedBuyer = await response.json()
      
      // Update the buyer in the local state
      setBuyers(prevBuyers => 
        prevBuyers.map(buyer => 
          buyer.id === buyerId 
            ? { ...buyer, status: newStatus, updatedAt: updatedBuyer.updatedAt }
            : buyer
        )
      )
      
      toast.success(`Status updated to "${newStatus}"`)
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status. Please try again.')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Handle CSV import
  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setImporting(true)
    
    const form = e.currentTarget
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    
    try {
      const formData = new FormData(form)
      const res = await fetch("/api/buyers/import", {
        method: "POST",
        body: formData,
      })
      
      console.log("Import response status:", res.status)
      
      // Check if the response is ok first
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`)
      }
      
      const data = await res.json()
      console.log("Import response data:", data)
      
      if (data.results?.errors > 0) {
        console.log("Import errors:", data.results.errorDetails)
        toast.error(`Import completed with ${data.results.errors} errors. Check console for details.`)
      } else {
        toast.success(`CSV imported successfully! ${data.results?.imported || 0} records imported.`)
      }
      
      // Clear the file input
      if (fileInput) {
        fileInput.value = ""
      }
      
      // Refetch data and filters to get the updated data
      console.log("Refetching data...")
      await fetchBuyers()
      await fetchFilters()
      console.log("Data refetched successfully")
      
    } catch (error) {
      console.error("Import failed:", error)
      toast.error("Failed to import CSV. Please try again.")
    } finally {
      setImporting(false)
    }
  }

  // Refetch filters when data changes
  const fetchFilters = async () => {
    try {
      const res = await fetch("/api/buyers/filters")
      const data = await res.json()
      setCities(data.cities)
      setPropertyTypes(data.propertyTypes)
      setStatuses(data.statuses)
      setTimelines(data.timelines)
    } catch (error) {
      console.error("Failed to fetch filters:", error)
    }
  }

  // Status color mapping for better UI
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-300 text-blue-800 border-blue-200'
      case 'qualified': return 'bg-green-300 text-green-800 border-green-200'
      case 'contacted': return 'bg-yellow-300 text-yellow-800 border-yellow-200'
      case 'visited': return 'bg-purple-300 text-purple-800 border-purple-200'
      case 'negotiation': return 'bg-teal-400 text-gray-800 border-gray-200'
      case 'converted': return 'bg-gray-300 text-gray-800 border-gray-200'
      case 'dropped': return 'bg-red-300 text-gray-800 border-red-200'
      default: return 'bg-gray-300 text-gray-800 border-gray-200'
    }
  }

  // Status Quick Action Component
  const StatusQuickAction = ({ buyer }: { buyer: Buyer }) => {
    const isUpdating = updatingStatus === buyer.id
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Badge className={`${getStatusColor(buyer.status)} cursor-pointer hover:opacity-80`}>
                {buyer.status}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statuses
            .filter(s => s !== buyer.status)
            .map((statusOption) => (
              <DropdownMenuItem
                key={statusOption}
                onClick={() => handleStatusUpdate(buyer.id, statusOption, buyer.updatedAt)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(statusOption).split(' ')[0]}`} />
                  {statusOption}
                </div>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Buyer Leads</h1>
            <p className="text-muted-foreground mt-1">{pagination?.total ?? 0} total leads</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/buyers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Lead
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Sort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {/* Search input */}
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              {/* City filter */}
              <Select
                value={city || "all"}
                onValueChange={(value) => {
                  setCity(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c, i) => (
                    <SelectItem key={i} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Property Type filter */}
              <Select
                value={propertyType || "all"}
                onValueChange={(value) => {
                  setPropertyType(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Property Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Property Types</SelectItem>
                  {propertyTypes.map((pt, i) => (
                    <SelectItem key={i} value={pt}>{pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select
                value={status || "all"}
                onValueChange={(value) => {
                  setStatus(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((s, i) => (
                    <SelectItem key={i} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Timeline filter */}
              <Select
                value={timeline || "all"}
                onValueChange={(value) => {
                  setTimeline(value === "all" ? "" : value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Timelines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Timelines</SelectItem>
                  {timelines.map((t, i) => (
                    <SelectItem key={i} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort filter */}
              <Select
                value={sort || "updatedDesc"}
                onValueChange={(value) => {
                  setSort(value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedDesc">Updated (Newest)</SelectItem>
                  <SelectItem value="updatedAsc">Updated (Oldest)</SelectItem>
                  <SelectItem value="budgetAsc">Budget (Low → High)</SelectItem>
                  <SelectItem value="budgetDesc">Budget (High → Low)</SelectItem>
                  <SelectItem value="nameAsc">Name (A → Z)</SelectItem>
                  <SelectItem value="nameDesc">Name (Z → A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Import / Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import / Export</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Import CSV */}
            <form onSubmit={handleImport} className="flex items-center gap-2">
              <Input 
                type="file" 
                name="file" 
                accept=".csv" 
                required 
                className="max-w-xs"
                disabled={importing}
              />
              <Button type="submit" variant="default" disabled={importing}>
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </>
                )}
              </Button>
            </form>

            {/* Export CSV */}
            <Button
              onClick={() => {
                const params = new URLSearchParams({
                  search: debouncedSearch,
                  city,
                  propertyType,
                  status,
                  timeline,
                  sort,
                })
                window.location.href = `/api/buyers/export?${params.toString()}`
              }}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Buyer Table / Cards */}
        {loading ? (
          <Card>
            <CardContent className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading leads...</span>
            </CardContent>
          </Card>
        ) : buyers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-muted-foreground mb-6">
                {search || city || propertyType || status || timeline
                  ? "Try adjusting your filters to see more results."
                  : "Get started by creating your first lead."}
              </p>
              <Button asChild>
                <Link href="/buyers/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Lead
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">City</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Property Type</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Budget</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Timeline</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Updated</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyers.map((buyer) => (
                        <tr key={buyer.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">{buyer.fullName}</td>
                          <td className="p-4 text-muted-foreground">{buyer.phone || "-"}</td>
                          <td className="p-4 text-muted-foreground">{buyer.city || "-"}</td>
                          <td className="p-4 text-muted-foreground">{buyer.propertyType || "-"}</td>
                          <td className="p-4">
                            <span className="font-medium">
                              {buyer.budgetMin && buyer.budgetMax
                                ? `₹${(buyer.budgetMin / 100000).toFixed(1)}L - ₹${(buyer.budgetMax / 100000).toFixed(1)}L`
                                : buyer.budgetMin
                                  ? `₹${(buyer.budgetMin / 100000).toFixed(1)}L+`
                                  : buyer.budgetMax
                                    ? `Up to ₹${(buyer.budgetMax / 100000).toFixed(1)}L`
                                    : "Not specified"}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{buyer.timeline || "-"}</td>
                          <td className="p-4">
                            <StatusQuickAction buyer={buyer} />
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">{new Date(buyer.updatedAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/buyers/${buyer.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {buyers.map((buyer) => (
                <Card key={buyer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{buyer.fullName}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {buyer.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{buyer.phone}</div>}
                          {buyer.city && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{buyer.city}</div>}
                        </div>
                      </div>
                      <StatusQuickAction buyer={buyer} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      {buyer.propertyType && <div className="flex items-center gap-2"><Home className="h-4 w-4 text-muted-foreground" />{buyer.propertyType}</div>}
                      {buyer.timeline && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{buyer.timeline}</div>}
                      <div className="flex items-center gap-2 col-span-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{buyer.budgetMin && buyer.budgetMax ? `₹${(buyer.budgetMin / 100000).toFixed(1)}L - ₹${(buyer.budgetMax / 100000).toFixed(1)}L` : "Budget not specified"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-muted-foreground">Updated {new Date(buyer.updatedAt).toLocaleDateString()}</span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/buyers/${buyer.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <Button variant="outline" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>Next</Button>
          </div>
        )}
      </div>
    </div>
  )
}