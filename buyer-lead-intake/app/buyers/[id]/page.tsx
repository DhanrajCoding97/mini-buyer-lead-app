"use client";
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BuyerForm } from '@/components/buyerForm';
import { useRouter } from "next/navigation"
import { type BuyerFormValues } from "@/lib/validations/buyer";
export default function BuyerPage({ params }: { params: Promise<{ id: string }> })  {
  const router = useRouter()
  const { id } = React.use(params)
  const [buyer, setBuyer] = useState<BuyerFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
	const [editMode, setEditMode] = useState(false)
  // useEffect(() => {
  // 	const fetchBuyer = async () => {
  //     const res = await fetch(`/api/buyers/${id}`);
  //     if (res.ok) {
  //       const data = await res.json();
  //       setBuyer(data);
  //       setForm(data);
  //     }
  //     setLoading(false);
  //   };
  //   if (id) fetchBuyer(); // only run when id is available
  // }, [id]);
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

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

  // const handleSave = async () => {
  //   const res = await fetch(`/api/buyers/${id}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(form),
  //   });

  //   if (res.ok) {
  //     const updated = await res.json();
  //     setBuyer(updated);
  //     setEditMode(false);
  //   }
  // };

		const handleDelete = async () => {
			if (!confirm("Are you sure you want to delete this buyer?")) return;

			const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
			if (res.ok) {
				router.push("/buyers"); // go back to list
			}
		};

	 async function handleSubmit(values: BuyerFormValues) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) router.push("/buyers")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-lg mx-auto mt-6">
      <CardContent className="space-y-4">
        {editMode ? (
          <BuyerForm mode="edit" onSubmit={handleSubmit} defaultValues={buyer} isSubmitting={isSubmitting} />
        ) : (
          <>
            <p>
              <strong>Name:</strong> {buyer.fullName}
            </p>
            <p>
              <strong>Email:</strong> {buyer.email}
            </p>
            <p>
              <strong>Phone:</strong> {buyer.phone}
            </p>

            <div className="flex gap-2">
              <Button onClick={() => setEditMode(true)}>Edit</Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
