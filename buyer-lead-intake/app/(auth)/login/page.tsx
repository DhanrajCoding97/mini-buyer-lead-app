// "use client"
 
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"

// export default function LoginPage() {

// 	const loginFormSchema = z.object({
// 		email: z.email({
// 			message: "Invalid email address.",
// 		}),
// 	});

// 	const form = useForm<z.infer<typeof loginFormSchema>>({
//     resolver: zodResolver(loginFormSchema),
//     defaultValues: {
//       email: "",
//     },
//   })

// 	function onSubmit(values: z.infer<typeof loginFormSchema>) {
//     // Do something with the form values.
//     // ✅ This will be type-safe and validated.
//     console.log(values)
//   }

// return (
//   <div className="flex min-h-screen flex-col items-center justify-center py-2">
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-[250px] min-w-[400px] p-6 flex flex-col items-center justify-center gap-4 border border-black/20 rounded-lg shadow-2xl">
//         <h1 className="text-xl font-semibold">Sign in with Email</h1>
//         <FormField
//           control={form.control}
//           name="email"
//           render={({ field }) => (
//             <FormItem className="w-full">
//               <FormLabel className="mb-1">Email</FormLabel>
//               <FormControl>
//                 <Input placeholder="Enter Email" {...field} />
//               </FormControl>
//               <FormMessage />
//               <FormDescription className="py-2">
//                 You will receive a magic link to login.
//               </FormDescription>
//             </FormItem>
//           )}
//         />
//         <Button type="submit">Submit</Button>
//       </form>
//     </Form>
//   </div>
//   )
// }

"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  const loginFormSchema = z.object({
    email: z.string().email({
      message: "Invalid email address.",
    }),
  });

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true)
    setMessage("")
    setIsSuccess(false)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/buyers`,
        },
      })

      if (error) {
        setMessage(error.message)
        setIsSuccess(false)
      } else {
        setMessage("Check your email for the magic link!")
        setIsSuccess(true)
        // Optionally reset the form
        form.reset()
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to resend magic link
  const handleResendLink = async () => {
    const email = form.getValues("email")
    if (!email) {
      setMessage("Please enter your email address first.")
      setIsSuccess(false)
      return
    }

    await onSubmit({ email })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gray-50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="min-w-[400px] p-8 flex flex-col items-center justify-center gap-6 bg-white border border-black/40 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to Buyer CRM</h1>
          {/* Success/Error Messages */}
          {message && (
            <Alert className={`w-full ${
              isSuccess 
                ? "border-green-200 bg-green-50" 
                : "border-red-200 bg-red-50"
            }`}>
              {isSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={
                isSuccess ? "text-green-800" : "text-red-800"
              }>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full space-y-1.5">
                <FormLabel className="block text-gray-700 font-medium">
                  Email Address<span className="text-red-800">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email address" 
                    type="email"
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                {!isSuccess && (
                  <FormDescription className="text-gray-500">
                    We'll send you a magic link to sign in securely.
                  </FormDescription>
                )}
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-11 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              "Send Magic Link"
            )}
          </Button>

          {/* Resend Link Option */}
          {isSuccess && (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder.
              </p>
              <Button 
                type="button"
                variant="outline"
                onClick={handleResendLink}
                disabled={isLoading}
                className="text-sm"
              >
                Resend Magic Link
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>By signing in, you agree to our terms of service.</p>
            <p>The magic link will expire in 1 hour.</p>
          </div>
        </form>
      </Form>
    </div>
  )
}