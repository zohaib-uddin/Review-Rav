import { Router } from 'express';
import { db } from '../../db';
import { users, addresses, orders, orderItems, otpVerifications } from '../../db/schema';
import { sendOTP, verifyOTP, sendOrderConfirmationEmail } from '../../lib/otp';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/checkout/send-otp
 * Send OTP to user's email
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const result = await sendOTP(email);

    if (result.success) {
      res.json({ success: true, otp: result.otp }); // OTP included for testing
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

/**
 * POST /api/checkout/verify-otp
 * Verify OTP code
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const result = await verifyOTP(email, otp);

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

/**
 * POST /api/checkout/place-order
 * Place order and auto-create account if needed
 */
router.post('/place-order', async (req, res) => {
  const client = await db.client; // Get transaction client if available
  const session = client || db;

  try {
    const {
      email,
      shippingAddress,
      billingAddress,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingMethod,
      orderNotes,
      paymentMethod = 'cod',
    } = req.body;

    if (!email || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Generate order number and tracking ID
    const orderNumber = `RVZ-${Date.now().toString().slice(-6)}`;
    const trackingId = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Check if user exists, if not create auto account
    let userId = null;
    const existingUser = await session.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Auto-create user account
      const newUser = await session.insert(users).values({
        email,
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        phone: shippingAddress.phone,
        role: 'customer',
        is_verified: true, // Verified via OTP
      }).returning();

      userId = newUser[0].id;
    }

    // Save shipping address
    const shippingAddressRecord = await session.insert(addresses).values({
      user_id: userId!,
      country: shippingAddress.country || 'Pakistan',
      province: shippingAddress.province,
      city: shippingAddress.city,
      postal_code: shippingAddress.postalCode,
      street_address: shippingAddress.address,
      phone: shippingAddress.phone,
      is_default: shippingAddress.saveAddress || false,
      address_type: 'shipping',
    }).returning();

    // Save billing address if different
    let billingAddressId = null;
    if (billingAddress && !billingAddress.sameAsShipping) {
      const billingAddressRecord = await session.insert(addresses).values({
        user_id: userId!,
        country: billingAddress.country || 'Pakistan',
        province: billingAddress.province,
        city: billingAddress.city,
        postal_code: billingAddress.postalCode,
        street_address: billingAddress.address,
        phone: billingAddress.phone,
        is_default: false,
        address_type: 'billing',
      }).returning();

      billingAddressId = billingAddressRecord[0].id;
    }

    // Create order
    const newOrder = await session.insert(orders).values({
      order_number: orderNumber,
      tracking_id: trackingId,
      user_id: userId,
      email,
      status: 'pending',
      payment_status: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      subtotal: subtotal.toString(),
      shipping_cost: shippingCost.toString(),
      tax: tax.toString(),
      total: total.toString(),
      shipping_address_id: shippingAddressRecord[0].id,
      billing_address_id: billingAddressId,
      order_notes: orderNotes,
      shipping_method: shippingMethod || 'standard',
    }).returning();

    // Create order items
    for (const item of items) {
      await session.insert(orderItems).values({
        order_id: newOrder[0].id,
        product_id: item.product.id,
        product_name: item.product.name,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        unit_price: (item.product.salePrice || item.product.price || 0).toString(),
        total_price: ((item.product.salePrice || item.product.price || 0) * item.quantity).toString(),
        sku: item.product.sku,
        size: item.size,
        color: item.color,
      });
    }

    // Send order confirmation email
    await sendOrderConfirmationEmail(
      email,
      orderNumber,
      trackingId,
      parseFloat(total),
      items.map((item: any) => ({
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price || 0,
      }))
    );

    res.json({
      success: true,
      order: {
        id: newOrder[0].id,
        order_number: orderNumber,
        tracking_id: trackingId,
        total,
      },
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

export default router;
