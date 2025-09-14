'use client';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBuyer } from '@/app/actions/buyers';
import { cn } from '@/lib/utils';
export default function NewBuyerPage() {
	// const [state, formAction] = useFormState(createBuyer, null);
	const [state, formAction] = useActionState(createBuyer, null);

	const router = useRouter();

	 // Handle successful creation
  useEffect(() => {
    if (state?.success) {
      router.push('/buyers');
    }
  }, [state?.success, router]);

  return (
		<div className="container mx-auto p-6 max-w-2xl">
				<h1 className="text-2xl font-bold text-white mb-6">Add New Lead</h1>
				<form action={formAction} className="bg-[#ECDFCC] shadow rounded-lg p-6 flex flex-col gap-3">
					{state?.error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
							{state.error}
						</div>
					)}

					{/* Full Name */}
					<div>
						<label htmlFor="fullName" className="block text-sm font-medium text-black mb-1">
							Full Name
							<span className='text-red-800'>*</span>
						</label>
						<input
							type="text"
							name="fullName"
							id="fullName"
							
							className={cn("w-full h-10 p-2 placeholder:text-gray-600 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black", 
								state?.errors?.fullName ? "border-red-600" : "border-black"
							)}
							placeholder="Enter full name"
						/>
						{state?.errors?.fullName && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.fullName}</p>}
					</div>

					{/* Email & Phone */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-black mb-1">
								Email
								<span className='text-red-800'>*</span> 	
							</label>
							<input
								type="email"
								name="email"
								id="email"
								className={cn("w-full h-10 p-2 placeholder:text-gray-600 text-black rounded-md border border-black  shadow-sm focus:border-blue-500 focus:ring-blue-500", 
									state?.errors?.email ? "border-red-600" : "border-black"
								)}
								placeholder="email@example.com"
							/>
							{state?.errors?.email && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.email}</p>}
						</div>
						<div>
							<label htmlFor="phone" className="block text-sm font-medium text-black mb-1">
								Phone
								<span className='text-red-800'>*</span>
							</label>
							<input
								type="tel"
								name="phone"
								id="phone"
								className={cn("w-full h-10 p-2 placeholder:text-gray-600 text-black rounded-md border border-black  shadow-sm focus:border-blue-500 focus:ring-blue-500", 
									state?.errors?.phone ? "border-red-600" : "border-black"
								)}
								placeholder="9876543210"
							/>
							{state?.errors?.phone && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.phone}</p>}
						</div>
					</div>

					{/* City & Source*/}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="city" className="block text-sm font-medium text-black mb-1">
								City<span className='text-red-800'>*</span>
							</label>
							<select
							name="city" 
							id="city" 
							// required 
							defaultValue=""
							className={cn(
								"block h-10 w-full p-2 mb-1 text-sm text-black rounded-md bg-[#ECDFCC] focus:ring-blue-500 focus:border-blue-500 dark:bg-[#ECDFCC] dark:border dark:placeholder-gray-400 dark:text-black dark:focus:ring-black dark:focus:border-black",
								state?.errors?.city ? "border-red-600" : "border-black"
							)}>
								<option value="">Select City</option> 
								<option value="Mumbai">Mumbai</option>
								<option value="Bangalore">Bangalore</option>
								<option value="Delhi">Delhi</option>
								<option value="Chennai">Chennai</option>
								<option value="Other">Other</option>
							</select>
							{state?.errors?.city && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.city}</p>}
						</div>
						<div>
							<label htmlFor="source" className="block text-sm font-medium text-black mb-1">
								Source<span className='text-red-800'>*</span>
							</label>
							<select
								name="source"
								id="source"
								defaultValue={""}
								className={cn(
									"block h-10 w-full p-2 mb-1 text-sm text-black rounded-md bg-[#ECDFCC] focus:ring-blue-500 focus:border-blue-500 dark:bg-[#ECDFCC] dark:border dark:placeholder-gray-400 dark:text-black dark:focus:ring-black dark:focus:border-black",
									state?.errors?.source ? "border-red-600" : "border-black"
								)}
>
								<option value="">Select Source</option>
								<option value="Website">Website</option>
								<option value="Referral">Referral</option>
								<option value="Walk-in">Walk-in</option>
								<option value="Call">Call</option>
								<option value="Other">Other</option>
							</select>
							{state?.errors?.source && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.source}</p>}
						</div>
					</div>

					{/* Property Type & BHK */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="propertyType" className="block text-sm font-medium text-black mb-1">
								Property Type<span className='text-red-800'>*</span>
							</label>
							<select
								name="propertyType"
								id="propertyType"
								defaultValue=""
								className={cn(
									"block h-10 w-full p-2 mb-1 text-sm text-black rounded-md bg-[#ECDFCC] focus:ring-blue-500 focus:border-blue-500 dark:bg-[#ECDFCC] dark:border dark:placeholder-gray-400 dark:text-black dark:focus:ring-black dark:focus:border-black",
									state?.errors?.propertyType ? "border-red-600" : "border-black"
								)}
							>
								<option value="">Select Type</option>
								<option value="Apartment">Apartment</option>
								<option value="Villa">Villa</option>
								<option value="Plot">Plot</option>
								<option value="Office">Office</option>
								<option value="Retail">Retail</option>
							</select>
							{state?.errors?.propertyType && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.propertyType}</p>}
						</div>
						<div>
							<label htmlFor="bhk" className="block text-sm font-medium text-black mb-1">
								BHK
								{/* <span className='text-red-800'>*</span> */}
							</label>
							<select
								name="bhk"
								id="bhk"
								defaultValue=""
								className={cn(
									"block h-10 w-full p-2 mb-1 text-sm text-black rounded-md bg-[#ECDFCC] focus:ring-blue-500 focus:border-blue-500 dark:bg-[#ECDFCC] dark:border dark:placeholder-gray-400 dark:text-black dark:focus:ring-black dark:focus:border-black",
									state?.errors?.bhk ? "border-red-600" : "border-black"
								)}
							>
								<option value="">Select BHK</option>
								<option value="Studio">Studio</option>
								<option value="1">1 BHK</option>
								<option value="2">2 BHK</option>
								<option value="3">3 BHK</option>
								<option value="4">4 BHK</option>
							</select>
							{state?.errors?.bhk && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.bhk}</p>}
						</div>
					</div>

					{/* Purpose & Timeline */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="purpose" className="block text-sm font-medium text-black mb-1">
								Purpose
								<span className='text-red-800'>*</span>
							</label>
							<select
								name="purpose"
								id="purpose"
								defaultValue=""
								className={cn(
									"block h-10 w-full p-2 mb-1 text-sm text-black rounded-md bg-[#ECDFCC] focus:ring-blue-500 focus:border-blue-500 dark:bg-[#ECDFCC] dark:border dark:placeholder-gray-400 dark:text-black dark:focus:ring-black dark:focus:border-black",
									state?.errors?.purpose ? "border-red-600" : "border-black"
								)}
							>
								<option value="">Select Purpose</option>
								<option value="Buy">Buy</option>
								<option value="Rent">Rent</option>
							</select>
							{state?.errors?.purpose && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.purpose}</p>}
						</div>
						<div>
							<label htmlFor="timeline" className="block text-sm font-medium text-black mb-1">
								Timeline
								<span className='text-red-800'>*</span>
							</label>
							<select
								name="timeline"
								id="timeline"
								defaultValue=""
								className={cn(
									"block h-10 w-full p-2 mb-1 text-sm text-black rounded-md bg-[#ECDFCC] focus:ring-blue-500 focus:border-blue-500 dark:bg-[#ECDFCC] dark:border dark:placeholder-gray-400 dark:text-black dark:focus:ring-black dark:focus:border-black",
									state?.errors?.timeline ? "border-red-600" : "border-black"
								)}
							>
								<option value="">Select Timeline</option>
								<option value="0-3m">0-3 months</option>
								<option value="3-6m">3-6 months</option>
								<option value=">6m">&gt;6 months</option>
								<option value="Exploring">Exploring</option>
							</select>
							{state?.errors?.timeline && <p className="mt-1 text-sm text-red-600 break-words">{state?.errors?.timeline}</p>}
						</div>
					</div>

					{/* Budget */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="budgetMin" className="block text-sm font-medium text-black mb-1">
								Min Budget (₹)
							</label>
							<input
								type="number"
								name="budgetMin"
								id="budgetMin"
								className="w-full h-10 p-2 placeholder:text-gray-600 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
								placeholder="500000"
							/>
						</div>
						<div>
							<label htmlFor="budgetMax" className="block text-sm font-medium text-black mb-1">
								Max Budget (₹)
							</label>
							<input
								type="number"
								name="budgetMax"
								id="budgetMax"
								className="w-full h-10 p-2 placeholder:text-gray-600 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
								placeholder="8000000"
							/>
						</div>
					</div>

					{/* Notes */}
					<div>
						<label htmlFor="notes" className="block text-sm font-medium text-black mb-1">
							Notes
						</label>
						<textarea
							name="notes"
							id="notes"
							rows={3}
							className="w-full p-2 placeholder:text-gray-600 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black resize-none"
							placeholder="Any additional notes..."
						/>
					</div>

					{/* Tags */}
					<div>
						<label htmlFor="tags" className="block text-sm font-medium text-black mb-1">
							Tags (comma separated)
						</label>
						<input
							type="text"
							name="tags"
							id="tags"
							className="w-full h-10 p-2 placeholder:text-gray-600 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
							placeholder="urgent, vip, callback"
						/>
					</div>

					{/* Submit */}
					<div className="flex gap-4 pt-4">
						{/* <button
							type="submit"
							disabled={loading}
							className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex-1"
						>
							{loading ? 'Creating...' : 'Create Lead'}
						</button> */}
						{/* <button
							type="button"
							onClick={() => router.push('/buyers')}
							className="bg-gray-300 text-black px-6 py-2 rounded-md hover:bg-gray-400"
						>
							Cancel
						</button> */}
						<button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex-1"
          >
            Create Lead
          </button>
					</div>
				</form>
		</div>
  );
}