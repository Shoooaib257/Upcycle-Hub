import BusinessDetailsForm from "@/components/forms/BusinessDetailsForm";

export default function BusinessDetailsPage() {
  return (
    <div className="bg-neutral min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-4xl mb-4">Business Details</h1>
          <p className="max-w-2xl mx-auto text-lg">
            Help your customers get to know your business better. Fill in your details below.
          </p>
        </div>
      </section>

      {/* Business Details Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <BusinessDetailsForm />
        </div>
      </section>
    </div>
  );
}