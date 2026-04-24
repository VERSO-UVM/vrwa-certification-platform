import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Stripe } from "stripe";
import type { InvoiceDetailDto, InvoiceDto } from "~/database/dtos";
import db from "~/database";
import { Status, user } from "~/database/schema";
import { adminProcedure, router, traineeProcedure } from "~/utils/trpc";
import { getStripe } from "~/utils/stripe";
import { updateReservationPaymentByInvoiceId } from "~/utils/stripe-reservation";

function mapStripeInvoice(inv: Stripe.Invoice): InvoiceDto {
  const firstLine = inv.lines?.data[0];
  return {
    id: inv.id,
    status: inv.status ?? null,
    amountDue: inv.amount_due,
    amountPaid: inv.amount_paid,
    currency: inv.currency ?? "usd",
    dueDate: inv.due_date,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    customerName: inv.customer_name ?? null,
    customerEmail: inv.customer_email ?? null,
    courseName: firstLine?.description ?? null,
    profileId: inv.metadata?.profileId ?? null,
    courseEventId: inv.metadata?.courseEventId ?? null,
    created: inv.created,
  };
}

function mapDetail(inv: Stripe.Invoice): InvoiceDetailDto {
  const base = mapStripeInvoice(inv);
  const lines = (inv.lines?.data ?? []).map((line) => ({
    description: line.description,
    amount: line.amount,
    currency: line.currency,
  }));
  return { ...base, lines };
}

const listInvoicesInput = z
  .object({
    year: z.number().int().min(2000).max(2100).optional(),
    month: z.number().int().min(1).max(12).optional(),
    status: z
      .enum(["all", "draft", "open", "paid", "void", "uncollectible"])
      .optional(),
  })
  .optional();

export const invoiceRouter = router({
  getMyInvoices: traineeProcedure.query(
    async ({ ctx }): Promise<InvoiceDto[]> => {
      const [u] = await db.client
        .select()
        .from(user)
        .where(eq(user.id, ctx.account.id));
      if (!u?.stripeCustomerId) {
        return [];
      }
      const stripe = getStripe();
      const { data: invoices } = await stripe.invoices.list({
        customer: u.stripeCustomerId,
        limit: 100,
      });
      return invoices.map(mapStripeInvoice);
    },
  ),

  getInvoiceDetail: traineeProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }): Promise<InvoiceDetailDto> => {
      const [u] = await db.client
        .select()
        .from(user)
        .where(eq(user.id, ctx.account.id));
      if (!u?.stripeCustomerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No invoices for this account.",
        });
      }
      const stripe = getStripe();
      const inv = await stripe.invoices.retrieve(input.invoiceId, {
        expand: ["lines.data"],
      });
      if (inv.customer !== u.stripeCustomerId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }
      return mapDetail(inv);
    }),

  listInvoices: adminProcedure
    .input(listInvoicesInput)
    .query(async ({ input }): Promise<InvoiceDto[]> => {
      const stripe = getStripe();
      const i = input ?? {};
      const params: Stripe.InvoiceListParams = { limit: 100 };
      if (i.year != null && i.month != null) {
        const start = new Date(i.year, i.month - 1, 1);
        const end = new Date(i.year, i.month, 0, 23, 59, 59);
        params.created = {
          gte: Math.floor(start.getTime() / 1000),
          lte: Math.floor(end.getTime() / 1000),
        };
      } else if (i.year != null) {
        const start = new Date(i.year, 0, 1);
        const end = new Date(i.year, 11, 31, 23, 59, 59);
        params.created = {
          gte: Math.floor(start.getTime() / 1000),
          lte: Math.floor(end.getTime() / 1000),
        };
      }
      if (i.status && i.status !== "all") {
        params.status = i.status;
      }
      const { data: invoices } = await stripe.invoices.list(params);
      return invoices.map(mapStripeInvoice);
    }),

  getInvoice: adminProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ input }): Promise<InvoiceDetailDto> => {
      const stripe = getStripe();
      const inv = await stripe.invoices.retrieve(input.invoiceId, {
        expand: ["lines.data"],
      });
      return mapDetail(inv);
    }),

  markPaidByCheck: adminProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        memo: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ input }) => {
      const stripe = getStripe();
      const inv = await stripe.invoices.retrieve(input.invoiceId);
      if (inv.status === "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invoice is already paid.",
        });
      }
      if (inv.status === "void" || inv.status === "uncollectible") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot mark as paid: status is ${inv.status}.`,
        });
      }
      await stripe.invoices.update(input.invoiceId, {
        description: input.memo,
      });
      await stripe.invoices.pay(input.invoiceId, { paid_out_of_band: true });
      await updateReservationPaymentByInvoiceId(input.invoiceId, Status.Paid);
      return { ok: true as const };
    }),

  waiveInvoice: adminProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ input }) => {
      const stripe = getStripe();
      const inv = await stripe.invoices.retrieve(input.invoiceId);
      if (inv.status === "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invoice is already paid.",
        });
      }
      if (inv.status === "void" || inv.status === "uncollectible") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot waive: status is ${inv.status}.`,
        });
      }
      await stripe.invoices.update(input.invoiceId, {
        description: "Waived",
      });
      await stripe.invoices.pay(input.invoiceId, { paid_out_of_band: true });
      await updateReservationPaymentByInvoiceId(input.invoiceId, Status.Paid);
      return { ok: true as const };
    }),

  refundInvoice: adminProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        reason: z.string().min(1).max(2000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const stripe = getStripe();
      const inv = await stripe.invoices.retrieve(input.invoiceId, {
        expand: ["charge"],
      });
      if (inv.status !== "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only paid invoices can be refunded.",
        });
      }
      const invWithCharge = inv as unknown as {
        charge?: Stripe.Charge | string | null;
      };
      const chargeField = invWithCharge.charge;
      if (!chargeField) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "No charge on invoice to refund (may be out-of-band payment).",
        });
      }
      const chargeObject =
        typeof chargeField === "string"
          ? await stripe.charges.retrieve(chargeField)
          : chargeField;
      if (chargeObject.refunded) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Charge is already refunded.",
        });
      }
      await stripe.refunds.create({
        charge: chargeObject.id,
        reason: "requested_by_customer",
      });
      if (input.reason) {
        await stripe.invoices.update(input.invoiceId, {
          metadata: { refundNote: input.reason },
        });
      }
      await updateReservationPaymentByInvoiceId(
        input.invoiceId,
        Status.Refunded,
      );
      return { ok: true as const };
    }),

  markUncollectible: adminProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ input }) => {
      const stripe = getStripe();
      const inv = await stripe.invoices.retrieve(input.invoiceId);
      if (inv.status !== "open") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only open invoices can be marked uncollectible.",
        });
      }
      await stripe.invoices.markUncollectible(input.invoiceId);
      await updateReservationPaymentByInvoiceId(
        input.invoiceId,
        Status.Uncollectible,
      );
      return { ok: true as const };
    }),

  voidInvoice: adminProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ input }) => {
      const stripe = getStripe();
      const inv = await stripe.invoices.retrieve(input.invoiceId);
      if (inv.status !== "draft" && inv.status !== "open") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft or open invoices can be voided.",
        });
      }
      if (inv.status === "open" && inv.amount_due === 0) {
        // still allow void in edge cases; Stripe may accept
      }
      await stripe.invoices.voidInvoice(input.invoiceId);
      await updateReservationPaymentByInvoiceId(input.invoiceId, Status.Void);
      return { ok: true as const };
    }),
});
