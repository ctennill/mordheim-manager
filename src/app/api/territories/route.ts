import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Territory } from '@/types/database'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('territories')
    .select('*')
    .order('name') as { data: Territory[] | null }

  return NextResponse.json(data ?? [])
}
