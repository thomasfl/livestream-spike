import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateUniqueId, isValidEmail } from '@/lib/utils'
import { CreateEmailRequest, CreateEmailResponse } from '@/types/email'

// GET /api/emails - Fetch all emails
export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error in GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/emails - Create a new email
export async function POST(request: NextRequest) {
  try {
    const body: CreateEmailRequest = await request.json()
    const { email } = body

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Generate unique ID
    let uniqueId: string
    let isUnique = false
    
    while (!isUnique) {
      uniqueId = generateUniqueId()
      
      // Check if ID already exists
      const { data: existingEmail } = await supabase
        .from('emails')
        .select('id')
        .eq('id', uniqueId)
        .single()
      
      if (!existingEmail) {
        isUnique = true
      }
    }

    // Insert new email
    const { data, error } = await supabase
      .from('emails')
      .insert({
        id: uniqueId!,
        email: email.toLowerCase().trim()
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'This email address is already registered' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response: CreateEmailResponse = {
      success: true,
      data
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/emails - Delete an email by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Delete the email
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}