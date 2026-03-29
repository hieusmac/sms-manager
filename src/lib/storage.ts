import type { Driver, GatewayCredentials } from '../types'

export const STORAGE_KEYS = {
  DRIVERS: 'sms-manager-drivers',
  CREDENTIALS: 'sms-manager-credentials',
} as const

export function saveDrivers(drivers: Driver[]): void {
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers))
}

export function loadDrivers(): Driver[] {
  const storedDrivers = localStorage.getItem(STORAGE_KEYS.DRIVERS)

  if (!storedDrivers) {
    return []
  }

  try {
    return JSON.parse(storedDrivers) as Driver[]
  } catch {
    return []
  }
}

export function saveCredentials(creds: GatewayCredentials): void {
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds))
}

export function loadCredentials(): GatewayCredentials | null {
  const storedCredentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS)

  if (!storedCredentials) {
    return null
  }

  try {
    return JSON.parse(storedCredentials) as GatewayCredentials
  } catch {
    return null
  }
}

export function clearDrivers(): void {
  localStorage.removeItem(STORAGE_KEYS.DRIVERS)
}
