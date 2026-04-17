import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

import banner1 from "../../assets/patientassets/banner1.png";
import banner2 from "../../assets/patientassets/banner2.png";
import banner3 from "../../assets/patientassets/banner3.png";
import banner4 from "../../assets/patientassets/banner4.png";
const banners = [
  {
    image: banner1,
    badge: "Patient-Centered Digital Care",
    title: "Smarter Healthcare For Modern Families",
    description:
      "Book appointments, connect with trusted doctors, manage your health records, and access care through one secure platform.",
  },
  {
    image: banner2,
    badge: "Fast Specialist Access",
    title: "Find The Right Doctor With Ease",
    description:
      "Browse doctors by specialty, compare available options, and choose the best consultant for your healthcare needs.",
  },
  {
    image: banner3,
    badge: "Care From Anywhere",
    title: "Secure Telemedicine For Everyday Life",
    description:
      "Attend online consultations, upload reports, and stay connected with your doctors from the comfort of home.",
  },
  {
    image: banner4,
    badge: "Safe And Connected Experience",
    title: "Manage Appointments, Records, And Payments",
    description:
      "Enjoy a smooth healthcare journey with simple booking, secure payments, digital updates, and organized medical access.",
  },
];

const services = [
  {
    title: "Doctor Appointments",
    text: "Search verified doctors and book appointments quickly through a simple patient-friendly process.",
  },
  {
    title: "Telemedicine",
    text: "Attend secure online consultations and stay connected with doctors without unnecessary travel.",
  },
  {
    title: "Medical Records",
    text: "Keep your reports, health details, and treatment history organized in one secure place.",
  },
  {
    title: "Secure Payments",
    text: "Complete appointment payments safely and manage transactions with confidence.",
  },
];

const stats = [
  { number: "250+", label: "Verified Doctors" },
  { number: "25K+", label: "Happy Patients" },
  { number: "40+", label: "Specialties" },
  { number: "24/7", label: "Digital Support" },
];

const specialties = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Gynecology",
  "Orthopedics",
  "Psychiatry",
];

const steps = [
  {
    no: "01",
    title: "Create Your Profile",
    text: "Register as a patient and set up your details for a smooth healthcare experience.",
  },
  {
    no: "02",
    title: "Find A Doctor",
    text: "Search by specialty, compare doctors, and choose the right consultant for your needs.",
  },
  {
    no: "03",
    title: "Book Appointment",
    text: "Confirm your appointment or consultation in just a few easy steps.",
  },
  {
    no: "04",
    title: "Manage Your Care",
    text: "Track appointments, payments, records, and updates in one convenient place.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(slider);
  }, []);

  return (
    <MainLayout>
      <section className="bg-[#f5fbff]">
        {/* Hero Slider */}
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden sm:h-[84vh] lg:h-[92vh]">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                currentSlide === index
                  ? "visible opacity-100"
                  : "invisible opacity-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className={`h-full w-full object-cover transition-transform duration-[6000ms] ${
                  currentSlide === index ? "scale-110" : "scale-100"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#003b6f]/85 via-[#005ca7]/55 to-[#00bbb3]/25" />

              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl">
                    <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                      {banner.badge}
                    </div>

                    <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                      {banner.title}
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
                      {banner.description}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        to="/appointments"
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#00bbb3] px-6 text-sm font-extrabold text-white transition hover:bg-[#009f98]"
                      >
                        Book Appointment
                      </Link>

                      <Link
                        to="/doctors"
                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white/20"
                      >
                        Find Doctors
                      </Link>
                    </div>

                    <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                      {stats.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                        >
                          <div className="text-lg font-extrabold text-white">
                            {item.number}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-white/85">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  currentSlide === index
                    ? "w-8 bg-[#00bbb3]"
                    : "w-3 bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
              Core Services
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#02539d] sm:text-4xl">
              Complete Healthcare Support In One Platform
            </h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Designed to simplify every step of your healthcare journey with
              secure, modern, and patient-friendly features.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="rounded-[24px] border border-[#d9edf9] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0070cd]/10 text-base font-extrabold text-[#0070cd]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-[#02539d]">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {service.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why choose + specialties */}
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="rounded-[28px] bg-[#0070cd] p-8 text-white shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#9ee9e5]">
              Why Choose Us
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight">
              Trusted Care With Better Digital Convenience
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/90">
              Our platform helps patients access healthcare faster, manage
              appointments more easily, and stay connected with care providers
              through one trusted digital experience.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Fast and simple appointment booking",
                "Secure telemedicine consultations",
                "Protected patient records and reports",
                "Consistent experience across all devices",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/95"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#d9edf9] bg-white p-8 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
              Popular Specialties
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#02539d]">
              Find The Specialist You Need
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Explore a range of specialties and connect with the right doctor
              for your healthcare needs.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {specialties.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#d9edf9] bg-[#f8fcff] px-4 py-2 text-sm font-bold text-[#02539d]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/doctors"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#00bbb3] px-6 text-sm font-extrabold text-white transition hover:bg-[#009f98]"
              >
                Browse Doctors
              </Link>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#00bbb3]">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#02539d] sm:text-4xl">
              Start Your Healthcare Journey In Four Steps
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.no}
                className="rounded-[24px] border border-[#d9edf9] bg-white p-6 shadow-sm"
              >
                <div className="text-3xl font-extrabold text-[#00bbb3]">
                  {step.no}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#02539d]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-[28px] bg-gradient-to-r from-[#0070cd] to-[#02539d] p-8 text-white shadow-sm sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#9ee9e5]">
                  Get Started
                </p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Experience Modern Healthcare With Confidence
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/90 sm:text-base">
                  Join a secure and patient-friendly healthcare platform for
                  appointments, consultations, payments, and records.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#00bbb3] px-6 text-sm font-extrabold text-white transition hover:bg-[#009f98]"
                >
                  Create Account
                </Link>
                <Link
                  to="/appointments"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-extrabold text-white transition hover:bg-white/20"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}