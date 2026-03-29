export type Driver = {
  id: string
  truckRego: string
  firstName: string
  phoneNumber: string
  message: string
  enabled: boolean
}

export type SMSStatus = 'idle' | 'pending' | 'processed' | 'sent' | 'delivered' | 'failed'

export type DriverWithStatus = Driver & {
  status: SMSStatus
  messageId?: string
  error?: string
}

export type GatewayCredentials = {
  login: string
  password: string
  serverUrl: string
}

export type SendSMSRequest = {
  phoneNumber: string
  message: string
}

export type SendSMSResponse = {
  id: string
  state: string
  recipients: Array<{
    phoneNumber: string
    state: string
    error?: string
  }>
}
