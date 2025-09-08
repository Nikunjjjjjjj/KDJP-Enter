const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };
    await transporter.sendMail(mailOptions);
};

// Send order notification email to owner/admin
const sendOrderNotificationToOwner = async (order) => {
    try {
        const subject = `🛒 New Order Received - ${order.orderId}`;
        
        const text = `
New Order Notification
=====================

Order Details:
- Order ID: ${order.orderId}
- Order Date: ${new Date(order.createdAt).toLocaleDateString()}
- Total Amount: ₹${order.totalPrice.toFixed(2)}
- Status: ${order.status}
- Payment Status: ${order.paymentStatus}

Customer Information:
- Name: ${order.customer.name}
- Email: ${order.customer.email}
- Phone: ${order.customer.phone}
- Organization: ${order.customer.organization || 'N/A'}
- Address: ${order.customer.address}

Order Items:
${order.items.map((item, index) => `
${index + 1}. ${item.title}
   - Publisher: ${item.publisher}
   - Quantity: ${item.quantity}
   - Price: ₹${item.price.toFixed(2)}
   - Subtotal: ₹${(item.quantity * item.price).toFixed(2)}
`).join('')}

Shipping Address: ${order.shippingAddress}
Notes: ${order.notes || 'No additional notes'}

Please process this order as soon as possible.

Best regards,
BookStore System
        `;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Order Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
        .customer-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #10b981; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .items-table th { background: #f3f4f6; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #2563eb; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 New Order Received</h1>
            <p>Order ID: ${order.orderId}</p>
        </div>
        
        <div class="content">
            <div class="order-info">
                <h3>📋 Order Details</h3>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> <span class="total">₹${order.totalPrice.toFixed(2)}</span></p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            </div>

            <div class="customer-info">
                <h3>👤 Customer Information</h3>
                <p><strong>Name:</strong> ${order.customer.name}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
                <p><strong>Organization:</strong> ${order.customer.organization || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.customer.address}</p>
            </div>

            <h3>📚 Order Items</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Publisher</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.publisher}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price.toFixed(2)}</td>
                            <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="order-info">
                <h3>🚚 Shipping Information</h3>
                <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                <p><strong>Notes:</strong> ${order.notes || 'No additional notes'}</p>
            </div>

            <div class="footer">
                <p>Please process this order as soon as possible.</p>
                <p><strong>BookStore System</strong></p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.OWNER_EMAIL , // Send to owner email or fallback to sender
            subject,
            text,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order notification email sent to owner for order ${order.orderId}`);
        
    } catch (error) {
        console.error('Error sending order notification to owner:', error);
        throw error;
    }
};

// Send order confirmation email to customer
const sendOrderConfirmationToCustomer = async (order) => {
    try {
        const subject = `✅ Order Confirmation - ${order.orderId}`;
        
        const text = `
Order Confirmation
=================

Dear ${order.customer.name},

Thank you for your order! We have received your order and it is being processed.

Order Details:
- Order ID: ${order.orderId}
- Order Date: ${new Date(order.createdAt).toLocaleDateString()}
- Total Amount: ₹${order.totalPrice.toFixed(2)}
- Status: ${order.status}
- Payment Status: ${order.paymentStatus}

Order Items:
${order.items.map((item, index) => `
${index + 1}. ${item.title}
   - Publisher: ${item.publisher}
   - Quantity: ${item.quantity}
   - Price: ₹${item.price.toFixed(2)}
   - Subtotal: ₹${(item.quantity * item.price).toFixed(2)}
`).join('')}

Shipping Address: ${order.shippingAddress}
Notes: ${order.notes || 'No additional notes'}

What's Next?
- You will receive a shipping confirmation once your order is dispatched
- Estimated delivery time: 3-5 business days
- If you have any questions, please contact us

Thank you for choosing BookStore!

Best regards,
BookStore Team
        `;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #10b981; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .items-table th { background: #f3f4f6; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #10b981; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .next-steps { background: #eff6ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Order Confirmation</h1>
            <p>Order ID: ${order.orderId}</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${order.customer.name}</strong>,</p>
            <p>Thank you for your order! We have received your order and it is being processed.</p>

            <div class="order-info">
                <h3>📋 Order Details</h3>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> <span class="total">₹${order.totalPrice.toFixed(2)}</span></p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            </div>

            <h3>📚 Your Order Items</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Publisher</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.publisher}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price.toFixed(2)}</td>
                            <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="order-info">
                <h3>🚚 Shipping Information</h3>
                <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                <p><strong>Notes:</strong> ${order.notes || 'No additional notes'}</p>
            </div>

            <div class="next-steps">
                <h3>📋 What's Next?</h3>
                <ul>
                    <li>You will receive a shipping confirmation once your order is dispatched</li>
                    <li>Estimated delivery time: 3-5 business days</li>
                    <li>If you have any questions, please contact us</li>
                </ul>
            </div>

            <div class="footer">
                <p>Thank you for choosing <strong>BookStore</strong>!</p>
                <p>Best regards,<br>BookStore Team</p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.customer.email,
            subject,
            text,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to customer ${order.customer.email} for order ${order.orderId}`);
        
    } catch (error) {
        console.error('Error sending order confirmation to customer:', error);
        throw error;
    }
};

module.exports = { 
    sendEmail, 
    sendOrderNotificationToOwner, 
    sendOrderConfirmationToCustomer 
};




