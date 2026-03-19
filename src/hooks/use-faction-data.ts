'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { type FactionPosition, type Equipment } from '@/types/database'

export interface FactionEquipmentRow {
  equipment_id: string
  is_faction_specific: boolean
  equipment: Equipment
}

export function useFactionPositions(factionId: string | null) {
  return useQuery({
    queryKey: ['faction-positions', factionId],
    queryFn: async () => {
      if (!factionId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('faction_positions')
        .select('*')
        .eq('faction_id', factionId)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as FactionPosition[]
    },
    enabled: !!factionId,
    staleTime: 5 * 60 * 1000, // positions don't change
  })
}

export function useFactionEquipment(factionId: string | null) {
  return useQuery({
    queryKey: ['faction-equipment', factionId],
    queryFn: async () => {
      if (!factionId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('faction_equipment')
        .select('equipment_id, is_faction_specific, equipment(*)')
        .eq('faction_id', factionId)
      if (error) throw error
      return (data ?? []) as FactionEquipmentRow[]
    },
    enabled: !!factionId,
    staleTime: 5 * 60 * 1000,
  })
}
