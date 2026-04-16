import MainLayout from "../layouts/MainLayout";

export default function PaymentCancel() {
  return (
    <MainLayout>
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <h2>Payment cancelled</h2>
        <p>The payment was cancelled. You can try again.</p>
      </div>
    </MainLayout>
  );
}
