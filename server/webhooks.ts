import type { Express, Request, Response } from "express";
import { Webhook } from "svix";
import { prisma } from "./prisma";

// Clerk webhook types
type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
  };
};

export function registerWebhooks(app: Express) {
  // Clerk webhook endpoint for user.created and user.updated events
  app.post("/api/webhooks/clerk", async (req: Request, res: Response) => {
    try {
      const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

      if (!WEBHOOK_SECRET) {
        console.error("CLERK_WEBHOOK_SECRET not configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      // Get the Svix headers for verification
      const svix_id = req.headers["svix-id"] as string;
      const svix_timestamp = req.headers["svix-timestamp"] as string;
      const svix_signature = req.headers["svix-signature"] as string;

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: "Missing svix headers" });
      }

      // Get the raw body (need to access req.rawBody set in index.ts)
      const payload = (req as any).rawBody;

      // Verify the webhook signature
      const wh = new Webhook(WEBHOOK_SECRET);
      let evt: ClerkWebhookEvent;

      try {
        evt = wh.verify(payload, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        }) as ClerkWebhookEvent;
      } catch (err) {
        console.error("Webhook verification failed:", err);
        return res.status(400).json({ error: "Webhook verification failed" });
      }

      // Handle the webhook event
      const { type, data } = evt;

      switch (type) {
        case "user.created":
          // Create user in database
          const primaryEmail = data.email_addresses?.[0]?.email_address;
          
          if (!primaryEmail) {
            console.error("No email found for user", data.id);
            return res.status(400).json({ error: "No email found" });
          }

          await prisma.user.upsert({
            where: { clerkId: data.id },
            create: {
              clerkId: data.id,
              email: primaryEmail,
            },
            update: {
              email: primaryEmail,
            },
          });

          console.log(`✅ User created in database: ${data.id} (${primaryEmail})`);
          break;

        case "user.updated":
          // Update user in database
          const updatedEmail = data.email_addresses?.[0]?.email_address;

          if (updatedEmail) {
            await prisma.user.upsert({
              where: { clerkId: data.id },
              create: {
                clerkId: data.id,
                email: updatedEmail,
              },
              update: {
                email: updatedEmail,
              },
            });

            console.log(`✅ User updated in database: ${data.id} (${updatedEmail})`);
          }
          break;

        case "user.deleted":
          // Delete user from database (cascade will handle workflows)
          await prisma.user.delete({
            where: { clerkId: data.id },
          });

          console.log(`✅ User deleted from database: ${data.id}`);
          break;

        default:
          console.log(`Unhandled webhook event type: ${type}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
