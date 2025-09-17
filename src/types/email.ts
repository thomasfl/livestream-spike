export interface Email {
  id: string
  email: string
  ip_address?: string | null
  last_viewed_at?: string | null
  created_at: string
}

export interface CreateEmailRequest {
  email: string
}

export interface CreateEmailResponse {
  success: boolean
  data?: Email
  error?: string
}