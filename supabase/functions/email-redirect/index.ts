import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const baseUrl = "https://livro-facil.vercel.app";
    
    // Extract the token and type from query parameters
    const token = url.searchParams.get("token");
    const type = url.searchParams.get("type");
    const email = url.searchParams.get("email");
    
    if (!token || !type) {
      return new Response("Missing required parameters", { status: 400 });
    }
    
    // Redirect to the correct URL with proper parameters
    const redirectUrl = new URL(baseUrl);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("type", type);
    if (email) {
      redirectUrl.searchParams.set("email", email);
    }
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": redirectUrl.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error in email-redirect function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);