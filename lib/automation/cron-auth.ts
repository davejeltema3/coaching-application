import { NextRequest } from 'next/server';

export function validateCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  
  if (!secret) {
    console.error('CRON_SECRET not set');
    return false;
  }
  
  return authHeader === `Bearer ${secret}`;
}
