export interface Email {
  id: string
  email: string
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