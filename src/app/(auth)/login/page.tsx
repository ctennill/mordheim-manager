import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1
            className="text-3xl font-bold tracking-wide text-gold"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Mordheim Manager
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          New to Mordheim Manager?{' '}
          <Link href="/register" className="text-gold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}
