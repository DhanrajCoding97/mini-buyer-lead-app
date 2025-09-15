import {createClient} from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import {redirect} from 'next/navigation'

export async function GET(request: NextRequest) {
    const {searchParams, origin} = new URL(request.url) 
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/buyers';

    if(code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code)
    
        if(!error) {
            //successful login redirect to /buyers
            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if(isLocalEnv) {
                redirect(`${origin}${next}`)
            } else if(forwardedHost){
                return redirect(`https://${forwardedHost}${next}`)
            } else {
                return redirect(`${origin}${next}`)
            }
        }
    }
    return redirect('/login?error=Could not authenticate user')
}