import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        typescript: true,
    })
    : ({} as Stripe); // Mock for build time to prevent import errors

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY missing. Stripe features will fail.");
}
