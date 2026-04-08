from datetime import datetime


def order_notification_email(order, items, user):
    rows = ""

    for item in items:
        rows += f"""
        <tr>
            <td style="padding:10px;border-bottom:1px solid #eee;">{item['product_name']}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;">{item['sku']}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;">{item['quantity']}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;">₹{item['unit_price']}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;">₹{item['total_price']}</td>
        </tr>
        """

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        
        <div style="max-width:700px;margin:auto;background:white;border-radius:10px;overflow:hidden;">
            
            <!-- Header -->
            <div style="background:#0d6efd;color:white;padding:20px;text-align:center;">
                <h2>🛒 New Order Received</h2>
            </div>

            <!-- Content -->
            <div style="padding:20px;">
                
                <h3>📦 Order Details</h3>
                <p><strong>Order Number:</strong> {order.order_number}</p>
                <p><strong>Date:</strong> {datetime.utcnow().strftime("%d %b %Y %H:%M")}</p>
                <p><strong>Total Amount:</strong> ₹{order.total_amount}</p>

                <hr/>

                <h3>👤 Customer Details</h3>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Email:</strong> {user.email}</p>

                <hr/>

                <h3>🧾 Order Items</h3>

                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f1f1f1;">
                            <th style="padding:10px;text-align:left;">Product</th>
                            <th style="padding:10px;text-align:left;">SKU</th>
                            <th style="padding:10px;text-align:left;">Qty</th>
                            <th style="padding:10px;text-align:left;">Price</th>
                            <th style="padding:10px;text-align:left;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>

                <hr/>

                <h3>💰 Summary</h3>
                <p>Subtotal: ₹{order.subtotal_amount}</p>
                <p>Shipping: ₹{order.shipping_amount}</p>
                <p><strong>Total: ₹{order.total_amount}</strong></p>

            </div>

            <!-- Footer -->
            <div style="background:#f8f9fa;padding:15px;text-align:center;">
                <p style="font-size:12px;color:#888;">
                    This is an automated notification from your store.
                </p>
            </div>

        </div>

    </body>
    </html>
    """