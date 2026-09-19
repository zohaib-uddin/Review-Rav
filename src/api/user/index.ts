import { Router } from 'express';
import { db } from '../../db';
import { users, addresses, orders, orderItems, wishlist } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get('/profile', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId as string),
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't return password hash
    const { password_hash, ...safeUser } = user;

    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile (name, phone only - email is read-only)
 */
router.put('/profile', async (req, res) => {
  try {
    const { userId, name, phone } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    await db.update(users)
      .set({
        name,
        phone,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

/**
 * GET /api/user/addresses
 * Get all addresses for a user
 */
router.get('/addresses', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const userAddresses = await db.query.addresses.findMany({
      where: eq(addresses.user_id, userId as string),
      orderBy: (addresses, { desc }) => [desc(addresses.is_default), desc(addresses.created_at)],
    });

    res.json({ success: true, addresses: userAddresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, message: 'Failed to get addresses' });
  }
});

/**
 * POST /api/user/addresses
 * Add new address
 */
router.post('/addresses', async (req, res) => {
  try {
    const { userId, country, province, city, postal_code, street_address, phone, is_default, address_type } = req.body;

    if (!userId || !province || !city || !street_address || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // If setting as default, unset other defaults first
    if (is_default) {
      await db.update(addresses)
        .set({ is_default: false })
        .where(and(eq(addresses.user_id, userId), eq(addresses.address_type, address_type || 'shipping')));
    }

    const newAddress = await db.insert(addresses).values({
      user_id: userId,
      country: country || 'Pakistan',
      province,
      city,
      postal_code,
      street_address,
      phone,
      is_default: is_default || false,
      address_type: address_type || 'shipping',
    }).returning();

    res.json({ success: true, address: newAddress[0] });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Failed to add address' });
  }
});

/**
 * PUT /api/user/addresses/:addressId
 * Update address
 */
router.put('/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const { country, province, city, postal_code, street_address, phone, is_default, address_type } = req.body;

    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Address ID required' });
    }

    // If setting as default, unset other defaults first
    if (is_default) {
      const addr = await db.query.addresses.findFirst({
        where: eq(addresses.id, addressId),
      });

      if (addr) {
        await db.update(addresses)
          .set({ is_default: false })
          .where(and(eq(addresses.user_id, addr.user_id), eq(addresses.address_type, address_type || addr.address_type)));
      }
    }

    await db.update(addresses)
      .set({
        country: country || 'Pakistan',
        province,
        city,
        postal_code,
        street_address,
        phone,
        is_default: is_default || false,
        address_type: address_type || 'shipping',
        updated_at: new Date(),
      })
      .where(eq(addresses.id, addressId));

    res.json({ success: true, message: 'Address updated successfully' });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
});

/**
 * DELETE /api/user/addresses/:addressId
 * Delete address
 */
router.delete('/addresses/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Address ID required' });
    }

    await db.delete(addresses).where(eq(addresses.id, addressId));

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
});

/**
 * GET /api/user/orders
 * Get all orders for a user
 */
router.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.user_id, userId as string),
      orderBy: (orders, { desc }) => [desc(orders.created_at)],
      with: {
        shippingAddress: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    res.json({ success: true, orders: userOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
});

/**
 * GET /api/user/orders/:orderId
 * Get single order details
 */
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID required' });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        shippingAddress: true,
        billingAddress: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to get order' });
  }
});

/**
 * GET /api/user/wishlist
 * Get user's wishlist
 */
router.get('/wishlist', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    const userWishlist = await db.query.wishlist.findMany({
      where: eq(wishlist.user_id, userId as string),
      with: {
        product: true,
      },
      orderBy: (wishlist, { desc }) => [desc(wishlist.created_at)],
    });

    res.json({ success: true, wishlist: userWishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to get wishlist' });
  }
});

/**
 * POST /api/user/wishlist
 * Add item to wishlist
 */
router.post('/wishlist', async (req, res) => {
  try {
    const { userId, productId, variantId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'User ID and Product ID required' });
    }

    // Check if already in wishlist
    const existing = await db.query.wishlist.findFirst({
      where: and(
        eq(wishlist.user_id, userId),
        eq(wishlist.product_id, productId),
        variantId ? eq(wishlist.variant_id, variantId) : undefined
      ),
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }

    const newItem = await db.insert(wishlist).values({
      user_id: userId,
      product_id: productId,
      variant_id: variantId || null,
    }).returning();

    res.json({ success: true, item: newItem[0] });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
});

/**
 * DELETE /api/user/wishlist/:itemId
 * Remove item from wishlist
 */
router.delete('/wishlist/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID required' });
    }

    await db.delete(wishlist).where(eq(wishlist.id, itemId));

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
});

export default router;
