import React from 'react';

export default function DeveloperEmergencyPage() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h1 className="mb-2 text-xl font-semibold">Developer Emergency Login</h1>
      <p className="mb-6 text-sm text-gray-600">
        Use only if the federation portal is unavailable. All actions are audited.
      </p>

      <form method="POST" action="/api/auth/emergency" className="space-y-4">
        <input type="hidden" name="role" value="developer" />

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="developer@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">TOTP Code (if required)</label>
          <input
            name="totp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="6-digit code"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Sign in (Emergency)
        </button>
      </form>
    </div>
  );
}

