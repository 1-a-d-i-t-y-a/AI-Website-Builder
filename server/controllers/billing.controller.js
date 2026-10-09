import crypto from "crypto";
import { PLANS } from "../config/plan.js";
import razorpay from "../config/razorpay.js";
import User from "../models/user.model.js";

export const billing = async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.user._id;
        const plan = PLANS[planType];

        if (!plan || plan.price === 0) {
            return res.status(400).json({ message: "invalid paid plan" });
        }

        const options = {
            amount: Math.round(plan.price * 100), // amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${userId.toString().slice(-4)}`,
            notes: {
                userId: userId.toString(),
                credits: plan.credits.toString(),
                plan: plan.plan
            }
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            order,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("Billing order error:", error);
        return res.status(500).json({ message: `billing error: ${error.message}` });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;
        const userId = req.user._id;
        const plan = PLANS[planType];

        if (!plan) {
            return res.status(400).json({ message: "Invalid plan type" });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required payment details" });
        }

        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed: invalid signature" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { credits: plan.credits },
                plan: plan.plan
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return res.status(500).json({ message: `verification error: ${error.message}` });
    }
};