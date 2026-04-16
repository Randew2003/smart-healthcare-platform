import MainLayout from "../layouts/MainLayout";

export default function PaymentSuccess() {
  return (
    <MainLayout>
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <h2>Payment successful</h2>
        <p>Your payment was completed successfully.</p>
      </div>
    </MainLayout>
  );
}
