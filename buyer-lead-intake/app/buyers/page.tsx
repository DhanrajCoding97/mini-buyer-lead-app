import {db} from '@/lib/db';
import {buyers} from '@/drizzle/schema';
import {desc} from 'drizzle-orm';
import Link from 'next/link';

export default async function BuyersPage(){
    const buyersList = await db
    .select()
    .from(buyers)
    .orderBy(desc(buyers.createdAt))
    .limit(20);

    return(
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Buyer Leads ({buyersList.length})</h1>
                <Link 
                href="/buyers/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                Add New Lead
                </Link>
            </div>
      
            {buyersList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg mb-4">No leads found</p>
                <Link 
                    href="/buyers/new"
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                >
                    Create Your First Lead
                </Link>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name & Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {buyersList.map((buyer) => (
                        <tr key={buyer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <div>
                            <div className="text-sm font-medium text-gray-900">{buyer.fullName}</div>
                            <div className="text-sm text-gray-500">{buyer.phone}</div>
                            {buyer.email && <div className="text-sm text-gray-500">{buyer.email}</div>}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                            {buyer.propertyType} {buyer.bhk && `(${buyer.bhk})`}
                            </div>
                            <div className="text-sm text-gray-500">{buyer.city}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                            {buyer.budgetMin && buyer.budgetMax 
                            ? `₹${(buyer.budgetMin / 100000).toFixed(1)}L - ₹${(buyer.budgetMax / 100000).toFixed(1)}L`
                            : buyer.budgetMin 
                            ? `₹${(buyer.budgetMin / 100000).toFixed(1)}L+`
                            : buyer.budgetMax
                            ? `Up to ₹${(buyer.budgetMax / 100000).toFixed(1)}L`
                            : 'Not specified'
                            }
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            buyer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                            buyer.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                            buyer.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                            buyer.status === 'Converted' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                            }`}>
                            {buyer.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(buyer.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                            <Link 
                            href={`/buyers/${buyer.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            >
                            View/Edit
                            </Link>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
    )
}