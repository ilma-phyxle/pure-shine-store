export const formatWhatsAppOrder = (orderData: {
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number; currency: string }>;
  total: string;
  customer?: string;
  mobile?: string;
  address?: string;
  email?: string;
}) => {
  const itemLines = orderData.items
    .map((item) => `*${item.quantity}x ${item.name}* - ${item.currency} ${item.price.toFixed(2)}`)
    .join('\n');

  const message = `*NEW ORDER: ${orderData.orderId}*\n\n` +
    `Hello CleanyGlow Cleaning Supplies,\n` +
    `I'd like to place an order for the following items:\n\n` +
    `${itemLines}\n\n` +
    `*TOTAL: ${orderData.total}*\n\n` +
    `👤 Customer: ${orderData.customer || 'Guest'}\n` +
    `📞 Mobile: ${orderData.mobile || 'N/A'}\n` +
    (orderData.email ? `📧 Email: ${orderData.email}\n` : '') +
    (orderData.address ? `📍 Delivery Address: ${orderData.address}\n` : '') +
    `\nPlease confirm my order. Thank you!`;

  return encodeURIComponent(message);
};

export const WHATSAPP_NUMBER = "+61416163126";

export const formatWhatsAppInquiry = (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const message = `*NEW INQUIRY: ${data.subject.toUpperCase()}*\n\n` +
    `Hello CleanyGlow Cleaning Supplies team,\n` +
    `I have a question/inquiry regarding your services.\n\n` +
    `*👤 Name:* ${data.name}\n` +
    `*📧 Email:* ${data.email}\n` +
    `*📝 Subject:* ${data.subject}\n\n` +
    `*💬 Message:* \n${data.message}\n\n` +
    `Please get back to me. Thank you!`;

  return encodeURIComponent(message);
};
