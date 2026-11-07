import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_API_SECRET_KEY || "");
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || "";

export function stripeWebhook(app: FastifyInstance) {
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      // Preserve raw bytes for signature verification
      (req as any).rawBody = body;
      try {
        done(null, JSON.parse(body.toString()));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.post("/webhook", handleWebhook);
}

async function handleWebhook(request: FastifyRequest, reply: FastifyReply) {
  const signature = request.headers["stripe-signature"];
  const rawBody = (request as any).rawBody as Buffer<ArrayBufferLike>;

  if (!signature || !rawBody) {
    return reply.status(400).send({ error: "Missing signature or body" });
  }

  let notification: Stripe.V2.Core.EventNotification;
  try {
    // Errors should not be control flow smh
    notification = await stripe.parseEventNotificationAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    request.log.warn({ err }, "Webhook signature verification failed");
    return reply.status(400).send({ error: "Invalid signature" });
  }

  reply.status(200).send({ received: true });

  await handleEventNotification(notification);
}

async function handleEventNotification(
  notification: Stripe.V2.Core.EventNotification,
) {
  switch (notification.type) {
    case "v1.payment_intent.succeeded": {
      const paymentIntent = await notification.fetchRelatedObject();
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
    }
  }
}
