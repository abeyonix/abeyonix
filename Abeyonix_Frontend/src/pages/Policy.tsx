import React from "react";

// Reusable Layout Component
const PolicyLayout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div className="space-y-4 text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
};

// ========================= PRIVACY POLICY =========================
export const PrivacyPolicy = () => (
  <PolicyLayout title="Privacy Policy">
    <p>
      We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our e-commerce platform.
    </p>

    <h2 className="text-xl font-semibold mt-4">Information We Collect</h2>
    <ul className="list-disc ml-6">
      <li>Name, email address, phone number</li>
      <li>Shipping and billing address</li>
      <li>Payment details (processed securely via third-party gateways)</li>
      <li>Browsing behavior and cookies</li>
    </ul>

    <h2 className="text-xl font-semibold mt-4">How We Use Your Information</h2>
    <ul className="list-disc ml-6">
      <li>To process and deliver your orders</li>
      <li>To communicate order updates</li>
      <li>To improve our services and user experience</li>
    </ul>

    <h2 className="text-xl font-semibold mt-4">Data Protection</h2>
    <p>
      We implement industry-standard security measures including encryption and secure servers to protect your data.
    </p>

    <h2 className="text-xl font-semibold mt-4">Your Rights</h2>
    <p>
      You may request access, correction, or deletion of your personal data at any time.
    </p>
  </PolicyLayout>
);

// ========================= TERMS & CONDITIONS =========================
export const TermsConditions = () => (
  <PolicyLayout title="Terms & Conditions">
    <p>
      By accessing this website, you agree to be bound by these terms and conditions.
    </p>

    <h2 className="text-xl font-semibold mt-4">User Responsibilities</h2>
    <ul className="list-disc ml-6">
      <li>Provide accurate account information</li>
      <li>Maintain confidentiality of login credentials</li>
      <li>Not misuse the platform</li>
    </ul>

    <h2 className="text-xl font-semibold mt-4">Product Information</h2>
    <p>
      We strive to ensure all product details and pricing are accurate, but errors may occur.
    </p>

    <h2 className="text-xl font-semibold mt-4">Limitation of Liability</h2>
    <p>
      We are not liable for indirect or consequential damages arising from use of the platform.
    </p>

    <h2 className="text-xl font-semibold mt-4">Governing Law</h2>
    <p>These terms are governed by the laws of India.</p>
  </PolicyLayout>
);

// ========================= REFUND & RETURN POLICY =========================
export const RefundPolicy = () => (
  <PolicyLayout title="Refund & Return Policy">
    <p>
      We offer returns and refunds under the following conditions:
    </p>

    <ul className="list-disc ml-6">
      <li>Returns accepted within 7 days of delivery</li>
      <li>Item must be unused and in original packaging</li>
      <li>Proof of purchase required</li>
    </ul>

    <h2 className="text-xl font-semibold mt-4">Non-Returnable Items</h2>
    <p>Some items such as personal care products may not be eligible for return.</p>

    <h2 className="text-xl font-semibold mt-4">Refund Process</h2>
    <p>
      Refunds are processed within 7–10 business days after inspection.
    </p>
  </PolicyLayout>
);

// ========================= SHIPPING POLICY =========================
export const ShippingPolicy = () => (
  <PolicyLayout title="Shipping Policy">
    <p>
      We aim to deliver your orders in a timely manner.
    </p>

    <ul className="list-disc ml-6">
      <li>Order processing: 2–3 business days</li>
      <li>Delivery time: 5–7 business days</li>
      <li>Shipping charges calculated at checkout</li>
    </ul>

    <h2 className="text-xl font-semibold mt-4">Delays</h2>
    <p>
      Delays may occur due to unforeseen circumstances such as weather or logistics issues.
    </p>
  </PolicyLayout>
);

// ========================= PAYMENT POLICY =========================
export const PaymentPolicy = () => (
  <PolicyLayout title="Payment Policy">
    <p>
      We support secure payment methods for your convenience.
    </p>

    <ul className="list-disc ml-6">
      <li>UPI, Credit/Debit Cards, Net Banking</li>
      <li>All transactions are encrypted</li>
    </ul>

    <h2 className="text-xl font-semibold mt-4">Failed Transactions</h2>
    <p>
      In case of failure, the amount will be refunded within 5–7 business days.
    </p>
  </PolicyLayout>
);

// ========================= CANCELLATION POLICY =========================
export const CancellationPolicy = () => (
  <PolicyLayout title="Cancellation Policy">
    <p>
      Orders can be cancelled before they are shipped.
    </p>

    <ul className="list-disc ml-6">
      <li>Cancellation requests must be submitted quickly</li>
      <li>Refunds will be processed after approval</li>
    </ul>
  </PolicyLayout>
);

// ========================= CONTACT PAGE =========================
export const ContactUs = () => (
  <PolicyLayout title="Contact Us">
    <p>Email: support@yourstore.com</p>
    <p>Phone: +91-XXXXXXXXXX</p>
    <p>Address: Your Business Address, India</p>
  </PolicyLayout>
);
