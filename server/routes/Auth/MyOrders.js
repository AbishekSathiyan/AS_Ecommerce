import express from "express";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import { adminAuth } from "../../firebaseAdmin.js";

const router = express.Router();

/* 
  ===========================================================
  ✅ Route: GET /api/orders/my-orders
  - Fetch all orders for the logged-in Firebase user
  ===========================================================
*/
router.get("/my-orders", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUID = decodedToken.uid;

    console.log("✅ Firebase UID:", firebaseUID);

    // Fetch all orders for the current user
    const orders = await Order.find({ user: firebaseUID })
      .sort({ createdAt: -1 })
      .lean();

    console.log("📦 Orders Fetched from DB:", JSON.stringify(orders, null, 2));

    if (!orders?.length) {
      console.log("⚠️ No orders found for this user.");
      return res.status(200).json([]);
    }

    // ✅ Map each order to include detailed info
    const mappedOrders = await Promise.all(
      orders.map(async (order) => {
        console.log("🧾 Processing Order ID:", order._id);

        const orderItems = await Promise.all(
          (order.orderItems || []).map(async (item) => {
            // If product image is missing, try to fetch from Product model
            if (!item.image || item.image === "") {
              try {
                const product = await Product.findById(item.product)
                  .select("images")
                  .lean();
                return {
                  ...item,
                  image:
                    product?.images?.[0] ||
                    "https://via.placeholder.com/150?text=No+Image",
                };
              } catch (err) {
                console.log("⚠️ Error fetching product image:", err);
                return {
                  ...item,
                  image: "https://via.placeholder.com/150?text=No+Image",
                };
              }
            }
            return item;
          })
        );

        return {
          _id: order._id,
          orderNumber:
            order.paymentMethod === "COD"
              ? `COD-${order._id}`
              : order.razorpay_order_id || `ORD-${order._id}`,
          items: orderItems,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
          status: order.status || "confirmed",
          deliveryStatus: order.isDelivered ? "delivered" : "pending",
          paymentStatus: order.paymentStatus || "Pending",
          paymentMethod: order.paymentMethod,
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          razorpay_order_id: order.razorpay_order_id || null,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      })
    );

    console.log(
      "✅ Final mappedOrders:",
      JSON.stringify(mappedOrders, null, 2)
    );

    res.status(200).json(mappedOrders);
  } catch (err) {
    console.error("❌ Fetch Orders Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* 
  ===========================================================
  ✅ Route: GET /api/orders/:uid (Admin or Debug)
  - Fetch all orders by Firebase UID directly
  ===========================================================
*/
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    console.log("✅ Firebase UID:", uid);

    const orders = await Order.find({ user: uid }).lean();
    console.log("📦 Orders Fetched from DB:", orders);

    const mappedOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber:
        order.paymentMethod === "COD"
          ? `COD-${order._id}`
          : order.razorpay_order_id || `ORD-${order._id}`,
      items: order.orderItems.map((item) => ({
        productId: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      itemsPrice: order.itemsPrice,
      shippingPrice: order.shippingPrice,
      totalPrice: order.totalPrice,
      status: order.status || "confirmed",
      deliveryStatus: order.isDelivered ? "delivered" : "pending",
      paymentStatus: order.paymentStatus || "Pending",
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      razorpay_order_id: order.razorpay_order_id || null,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    console.log("✅ Final mappedOrders:", mappedOrders);
    res.status(200).json(mappedOrders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
