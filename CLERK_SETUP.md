# Clerk Authentication Setup Guide

## 🔐 Complete Clerk Integration

This application now has **full Clerk authentication** enabled. Follow these steps to configure it properly.

---

## 📋 Prerequisites

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application in Clerk Dashboard
3. Choose authentication methods (Email, Google, GitHub, etc.)

---

## 🔑 Step 1: Get Your API Keys

### From Clerk Dashboard:

1. Go to **API Keys** section
2. Copy the following:
   - `Publishable Key` (starts with `pk_test_` or `pk_live_`)
   - `Secret Key` (starts with `sk_test_` or `sk_live_`)

### Add to `.env`:

```env
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

---

## 🪝 Step 2: Configure Webhooks (User Sync)

Webhooks automatically sync user data from Clerk to your database.

### In Clerk Dashboard:

1. Go to **Webhooks** section
2. Click **Add Endpoint**
3. Enter your endpoint URL:
   ```
   https://your-domain.com/api/webhooks/clerk
   ```
   
   For local development:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/clerk
   ```

4. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`

5. Copy the **Signing Secret** (starts with `whsec_`)

6. Add to `.env`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## 🧪 Step 3: Test Locally with ngrok

Since webhooks need a public URL, use ngrok for local development:

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, start ngrok
ngrok http 5000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Use it in Clerk webhook settings: https://abc123.ngrok.io/api/webhooks/clerk
```

---

## 🎯 Step 4: Database Migration

Run Prisma migration to create the User table:

```bash
npx prisma generate
npx prisma db push
```

This creates the `User` model linked to Clerk users.

---

## ✅ Verification Checklist

- [ ] `.env` has all 4 Clerk variables
- [ ] Webhook endpoint configured in Clerk Dashboard
- [ ] Webhook subscribed to user events
- [ ] Database migration completed
- [ ] App starts without errors

---

## 🧩 How It Works

### Authentication Flow:

1. **User Signs Up/In** → Clerk handles authentication
2. **Clerk Webhook Fires** → `user.created` event sent to `/api/webhooks/clerk`
3. **Server Creates User** → User record created in PostgreSQL
4. **Token Verification** → All API requests verify Clerk JWT token
5. **User Scoping** → Workflows are scoped to authenticated user

### Protected Routes:

**Frontend (Client):**
```tsx
<SignedIn>
  <Editor />  {/* Only shown to authenticated users */}
</SignedIn>
<SignedOut>
  <RedirectToSignIn />
</SignedOut>
```

**Backend (Server):**
```typescript
app.get("/api/workflows", requireClerkAuth, async (req, res) => {
  // Only accessible with valid Clerk token
});
```

---

## 🚨 Troubleshooting

### Error: "Missing VITE_CLERK_PUBLISHABLE_KEY"
- Check `.env` file has `VITE_CLERK_PUBLISHABLE_KEY`
- Restart dev server after adding env vars

### Error: "No authentication token provided"
- Client not sending token → Check Clerk Provider setup
- Token expired → User needs to sign in again

### Webhook not receiving events:
- Check ngrok is running for local dev
- Verify webhook URL is correct in Clerk Dashboard
- Check webhook secret matches `.env`

### User not created in database:
- Check webhook endpoint logs: `console.log` in `server/webhooks.ts`
- Verify database connection
- Check Prisma schema matches

---

## 🎨 UI Components

### Sign In Page: `/sign-in`
- Clerk's pre-built UI with custom dark theme
- Email/password + social logins

### Sign Up Page: `/sign-up`
- User registration flow
- Email verification

### User Profile in TopNav:
- Avatar with user initials
- Dropdown with email and sign-out

---

## 🔐 Security Features

✅ **JWT Token Verification** - All requests verified with Clerk
✅ **User Scoping** - Workflows isolated per user
✅ **Auto User Sync** - Webhooks keep DB in sync
✅ **Secure Sessions** - Clerk manages session tokens
✅ **HTTPS Required** - Production enforces SSL

---

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Backend SDK](https://clerk.com/docs/references/backend/overview)
- [Webhooks Guide](https://clerk.com/docs/integrations/webhooks)

---

## 🎉 You're All Set!

Authentication is now fully configured. Users can:
- ✅ Sign up / Sign in
- ✅ Create workflows (scoped to their account)
- ✅ View their workflow history
- ✅ Sign out securely

All API endpoints are protected and require authentication! 🔒
