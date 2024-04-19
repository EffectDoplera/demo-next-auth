import { logout } from '@/features/sign-up/api'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Home</h1>
        <form action={logout}>
          <button type="submit">
            {'Logout'}
          </button>
        </form>
      </div>
    </main>
  );
}
