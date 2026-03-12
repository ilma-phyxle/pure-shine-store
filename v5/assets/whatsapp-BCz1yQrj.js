const l=e=>{const s=e.items.map(n=>`*${n.quantity}x ${n.name}* - ${n.currency} ${n.price.toFixed(2)}`).join(`
`),o=`*NEW ORDER: ${e.orderId}*

Hello CleanyGlow Cleaning Supplies,
I'd like to place an order for the following items:

${s}

*TOTAL: ${e.total}*

👤 Customer: ${e.customer||"Guest"}
📞 Mobile: ${e.mobile||"N/A"}
`+(e.email?`📧 Email: ${e.email}
`:"")+(e.address?`📍 Delivery Address: ${e.address}
`:"")+`
Please confirm my order. Thank you!`;return encodeURIComponent(o)},i="+61416163126";export{i as WHATSAPP_NUMBER,l as formatWhatsAppOrder};
