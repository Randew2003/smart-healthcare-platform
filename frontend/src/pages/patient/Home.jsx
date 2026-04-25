import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import MainLayout from "../../layouts/MainLayout";

import banner1 from "../../assets/patientassets/banner1.png";
import banner2 from "../../assets/patientassets/banner2.png";
import banner3 from "../../assets/patientassets/banner3.png";
import banner4 from "../../assets/patientassets/banner4.png";
import banner5 from "../../assets/patientassets/banner5.png";
import homeMiddleBanner from "../../assets/patientassets/homeMiddleBanner.png";

const banners = [
  {
    image: banner1,
    title: "Healthcare Made Easier",
    highlight: "For Everyone",
    description:
      "Book appointments, consult doctors online, manage records, and complete secure payments through one simple healthcare platform.",
  },
  {
    image: banner2,
    title: "Find The Right Doctor",
    highlight: "With Confidence",
    description:
      "Search trusted doctors by specialty, compare services, and choose the best healthcare professional for your needs.",
  },
  {
    image: banner3,
    title: "Care From Anywhere,",
    highlight: "Anytime",
    description:
      "Connect with doctors through secure telemedicine, share reports, and receive guidance without unnecessary travel.",
  },
  {
    image: banner4,
    title: "Keep Your Health Information",
    highlight: "Organized",
    description:
      "Access appointments, reports, prescriptions, payment history, and medical updates in one secure place.",
  },
  {
    image: banner5,
    title: "A Better Way To",
    highlight: "Manage Your Care",
    description:
      "Experience a smoother patient journey with trusted doctors, easy booking, online payments, and reliable support.",
  },
];

const services = [
  {
    title: "Doctor Appointments",
    text: "Search verified doctors and book physical appointments quickly with a simple process.",
  },
  {
    title: "Telemedicine",
    text: "Consult doctors online using secure video consultation from anywhere.",
  },
  {
    title: "Medical Records",
    text: "Store reports, prescriptions, and treatment history safely in one place.",
  },
  {
    title: "Secure Payments",
    text: "Pay appointment and consultation fees online with confidence.",
  },
];

const stats = [
  { number: "250+", label: "Verified Doctors" },
  { number: "25K+", label: "Patients Served" },
  { number: "40+", label: "Specialties" },
  { number: "24/7", label: "Patient Support" },
];

const benefits = [
  "Verified healthcare professionals",
  "Simple appointment booking",
  "Secure online consultations",
  "Organized medical records",
  "Safe online payments",
  "Fast patient updates",
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
    title: "Create Profile",
    text: "Register and set up your patient profile with basic health details.",
  },
  {
    no: "02",
    title: "Find Doctor",
    text: "Search doctors by specialty, service, availability, and consultation type.",
  },
  {
    no: "03",
    title: "Book Appointment",
    text: "Choose a time slot and confirm your visit or online consultation.",
  },
  {
    no: "04",
    title: "Manage Care",
    text: "Track records, payments, appointments, and updates from your dashboard.",
  },
];

const trustItems = [
  {
    title: "Secure Data",
    text: "Patient records and sensitive healthcare details are handled with privacy-focused workflows.",
  },
  {
    title: "Reliable Access",
    text: "Patients can access bookings, payments, and medical information from any device.",
  },
  {
    title: "Better Communication",
    text: "Stay connected with doctors through appointment updates and online consultations.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: false,
      offset: 120,
      easing: "ease-out-cubic",
    });

    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }, []);

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5500);

    return () => clearInterval(slider);
  }, []);

  return (
    <MainLayout>
      <section className="bg-[#F6FAFD] text-slate-800">
        {/* HERO */}
        <div className="relative min-h-screen w-full overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner.title}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index
                  ? "visible opacity-100"
                  : "invisible opacity-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className={`h-full w-full object-cover transition-transform duration-[7500ms] ${
                  currentSlide === index ? "scale-105" : "scale-100"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#163F73]/76 via-[#2477B8]/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-black/5" />

              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-8">
                  <div className="max-w-2xl" data-aos="fade-up">
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                      {banner.title}{" "}
                      <span className="text-[#35B85A]">
                        {banner.highlight}
                      </span>
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-8 text-white/90">
                      {banner.description}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        to="/appointments"
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#35B85A] px-6 text-sm font-semibold text-white transition hover:bg-white hover:text-[#2459A6]"
                      >
                        Book Appointment
                      </Link>

                      <Link
                        to="/doctors"
                        className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-[#2459A6] transition hover:bg-[#EAF6FF]"
                      >
                        Find Doctors
                      </Link>
                    </div>

                    <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                      {stats.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-lg border border-white/20 bg-white/12 p-4 backdrop-blur-sm"
                        >
                          <div className="text-xl font-bold text-white">
                            {item.number}
                          </div>
                          <div className="mt-1 text-xs font-medium text-white/80">
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

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? "w-8 bg-[#35B85A]"
                    : "w-2 bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* INTRO SERVICES */}
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div data-aos="fade-right">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Our Services
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">
                Complete Digital Healthcare Support
              </h2>
            </div>

            <p
              data-aos="fade-left"
              className="text-base leading-8 text-slate-600"
            >
              HealthCare brings essential patient services into one connected
              platform. From finding doctors to managing appointments,
              consultations, records, and payments, every feature is designed to
              reduce waiting time and improve access to care.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => (
              <div
                key={service.title}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="rounded-xl border border-[#D8EAF6] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF6FF] text-sm font-bold text-[#2477B8]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#2459A6]">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {service.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* WHY CHOOSE */}
        <div className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div
            data-aos="fade-right"
            className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#D8EAF6] lg:p-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
              Why Choose HealthCare
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#2459A6]">
              Designed For A Faster, Safer Patient Experience
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Patients often face long waiting times, scattered records, and
              confusing booking processes. HealthCare solves this by creating a
              single, clear, and secure path for accessing medical services.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[#D8EAF6] bg-[#F6FAFD] px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            data-aos="fade-left"
            className="rounded-2xl bg-[#2459A6] p-8 text-white shadow-sm lg:p-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#BFEFFF]">
              Popular Specialties
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">
              Find The Specialist You Need
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/85">
              Explore trusted doctors across major medical specialties and book
              the right consultation for your health needs.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {specialties.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/doctors"
                className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-[#2459A6] transition hover:bg-[#EAF6FF]"
              >
                Browse Doctors
              </Link>
            </div>
          </div>
        </div>

        {/* FULL WIDTH IMAGE BANNER ONLY WITH AOS */}
        <div
          className="w-full overflow-hidden bg-white"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <img
            src={homeMiddleBanner}
            alt="Healthcare Banner"
            className="h-auto w-full object-cover"
            onLoad={() => AOS.refresh()}
          />
        </div>

        {/* HOW IT WORKS */}
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2459A6] sm:text-4xl">
              Start Your Healthcare Journey In Four Steps
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              A simple process that helps patients move from registration to
              care management without confusion.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.no}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                className="rounded-xl border border-[#D8EAF6] bg-white p-6 shadow-sm"
              >
                <div className="text-3xl font-bold text-[#35B85A]">
                  {step.no}
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#2459A6]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TRUST SECTION */}
        <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div
            data-aos="fade-up"
            className="grid gap-10 rounded-2xl border border-[#D8EAF6] bg-white p-8 shadow-sm lg:grid-cols-3 lg:p-10"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#35B85A]">
                Patient Trust
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#2459A6]">
                Built For Secure Digital Care
              </h2>
            </div>

            <div className="lg:col-span-2">
              <p className="text-sm leading-7 text-slate-600">
                HealthCare focuses on safe access, reliable communication, and
                clean patient workflows. Patients can manage their health journey
                with better visibility, while doctors can support care through a
                more organized digital system.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {trustItems.map((item) => (
                  <div key={item.title} className="rounded-lg bg-[#F6FAFD] p-5">
                    <h3 className="text-sm font-semibold text-[#2459A6]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div
            data-aos="fade-up"
            className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#2459A6] via-[#2477B8] to-[#28BEE4] shadow-sm"
          >
            <div className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  Get Started
                </p>

                <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  Ready To Manage Your Healthcare Online?
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/85 sm:text-base">
                  Create your patient account and access appointments, online
                  doctor consultations, secure payments, and medical records in
                  one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-[#2459A6] transition hover:bg-[#EAF6FF]"
                >
                  Create Account
                </Link>

                <Link
                  to="/appointments"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white hover:text-[#2459A6]"
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