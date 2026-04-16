export function submitPayHereCheckout(payhere) {
  if (!payhere?.checkoutUrl) {
    throw new Error("Missing PayHere checkoutUrl");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = payhere.checkoutUrl;

  // If you want a new tab:
  // form.target = "_blank";

  const fields = {
    merchant_id: payhere.merchant_id,
    return_url: payhere.return_url,
    cancel_url: payhere.cancel_url,
    notify_url: payhere.notify_url,
    order_id: payhere.order_id,
    items: payhere.items,
    currency: payhere.currency,
    amount: payhere.amount,
    first_name: payhere.first_name,
    last_name: payhere.last_name,
    email: payhere.email,
    phone: payhere.phone,
    address: payhere.address,
    city: payhere.city,
    country: payhere.country,
    hash: payhere.hash
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value == null ? "" : String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}
