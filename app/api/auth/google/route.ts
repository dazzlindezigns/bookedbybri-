import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl, getAuthenticatedClient } from '@/lib/google'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    const url = getAuthUrl()
    return NextResponse.redirect(url)
  }

  // Exchange code for tokens
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  try {
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.refresh_token) {
      return new NextResponse(
        '<html><body><p style="font-family:sans-serif;padding:24px;color:red">No refresh token received. Please revoke app access in Google and try again, then authorize.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    const sb = createSupabaseAdminClient()
    await sb.from('admin_settings').upsert(
      { key: 'google_refresh_token', value: tokens.refresh_token },
      { onConflict: 'key' }
    )

    return new NextResponse(
      '<html><body><p style="font-family:sans-serif;padding:24px;color:green">✓ Google account connected! You can close this tab and return to admin settings.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new NextResponse(
      `<html><body><p style="font-family:sans-serif;padding:24px;color:red">Error: ${message}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
}
