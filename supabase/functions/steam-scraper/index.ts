// @ts-expect-error: O VSCode espera módulos Node, mas o Supabase usa Deno.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    const response = await fetch(url)
    const html = await response.text()

    const titleMatch = html.match(/<div class="workshopItemTitle">([^<]+)<\/div>/)
    const title = titleMatch ? titleMatch[1].trim() : ''

    const imgMatch = html.match(/<link rel="image_src" href="([^"]+)">/)
    const image = imgMatch ? imgMatch[1] : ''

    return new Response(
      JSON.stringify({ title, image }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) { 
    // Tipagem segura sem usar 'any'
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(JSON.stringify({ error: errorMessage }), { 
      headers: corsHeaders, 
      status: 400 
    })
  }
})