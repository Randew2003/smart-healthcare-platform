import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AOS from "aos";
import "aos/dist/aos.css";

import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";
import banner3 from "../assets/banner3.png";
import banner4 from "../assets/banner4.png";

const banners = [
  {
    image: banner1,
    badge: "Sri Lanka's Trusted Digital Healthcare Platform",
    title: "Smarter Healthcare For Modern Families",
    highlight: "Smarter Healthcare",
    description:
      "Book appointments, connect with experienced doctors, manage records, and access trusted digital care through one powerful healthcare platform."
  },
  {
    image: banner2,
    badge: "Fast Doctor Access",
    title: "Easy Appointment Booking With Trusted Doctors",
    highlight: "Easy Appointment",
    description:
      "Search doctors by specialty, check availability, and confirm your appointments quickly with a smooth and premium booking experience."
  },
  {
    image: banner3,
    badge: "Care From Anywhere",
    title: "Telemedicine That Keeps You Connected",
    highlight: "Telemedicine",
    description:
      "Attend secure online consultations, upload reports, and receive professional healthcare guidance from the comfort of your home."
  },
  {
    image: banner4,
    badge: "Safe & Connected Care",
    title: "Secure Services Built Around Your Health",
    highlight: "Secure Services",
    description:
      "Access medical records, receive updates instantly, and enjoy a reliable healthcare journey with confidence and convenience."
  }
];

const services = [
  {
    title: "Doctor Appointments",
    text: "Book consultations with qualified doctors through an easy, patient-friendly channeling experience."
  },
  {
    title: "Online Consultations",
    text: "Meet doctors virtually using secure telemedicine features built for convenience and trust."
  },
  {
    title: "Medical Reports",
    text: "Upload and manage reports, scans, and health documents in one organized digital space."
  },
  {
    title: "Digital Prescriptions",
    text: "Receive prescriptions online and maintain a record of your treatment and medical history."
  },
  {
    title: "Secure Payments",
    text: "Complete healthcare transactions safely with a smooth and reliable payment process."
  },
  {
    title: "Smart Notifications",
    text: "Get reminders, appointment confirmations, consultation updates, and healthcare alerts instantly."
  }
];

const stats = [
  { number: "25K+", label: "Patients Supported" },
  { number: "250+", label: "Verified Doctors" },
  { number: "40+", label: "Specialties Available" },
  { number: "99%", label: "Secure Service Experience" }
];

const specialties = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Gynecology",
  "Orthopedics",
  "Psychiatry"
];

const steps = [
  {
    no: "01",
    title: "Create Account",
    text: "Register as a patient and securely manage your personal healthcare profile."
  },
  {
    no: "02",
    title: "Find Your Doctor",
    text: "Browse specialties, compare doctors, and choose the right healthcare professional."
  },
  {
    no: "03",
    title: "Book or Consult",
    text: "Channel an appointment or join an online video consultation with ease."
  },
  {
    no: "04",
    title: "Manage Care",
    text: "View prescriptions, upload reports, and stay updated with your medical journey."
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 80,
      easing: "ease-out-cubic"
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const renderTitle = (banner) => {
    const parts = banner.title.split(banner.highlight);

    return (
      <>
        {parts[0]}
        <span style={styles.titleHighlight}>{banner.highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <section style={styles.heroSection}>
          {banners.map((banner, index) => (
            <div
              key={index}
              style={{
                ...styles.slideWrapper,
                opacity: currentSlide === index ? 1 : 0,
                visibility: currentSlide === index ? "visible" : "hidden"
              }}
            >
              <div
                style={{
                  ...styles.imageLayer,
                  backgroundImage: `url(${banner.image})`,
                  transform: currentSlide === index ? "scale(1.08)" : "scale(1)"
                }}
              />

              <div style={styles.overlayDark}></div>
              <div style={styles.overlayGreen}></div>
              <div style={styles.overlayGlow}></div>

              <div style={styles.heroContentWrap}>
                <div style={styles.heroTextBox} data-aos="fade-right">
                  <div style={styles.badge}>{banner.badge}</div>

                  <h1 style={styles.heroTitle}>{renderTitle(banner)}</h1>

                  <p style={styles.heroDescription}>{banner.description}</p>

                  <div style={styles.heroButtons}>
                    <Link to="/appointments" style={styles.primaryBtn}>
                      Book Appointment
                    </Link>

                    <Link to="/services" style={styles.secondaryBtn}>
                      Explore Services
                    </Link>
                  </div>

                  <div style={styles.heroMiniStats}>
                    <div style={styles.heroMiniCard}>
                      <h4 style={styles.heroMiniNumber}>250+</h4>
                      <p style={styles.heroMiniText}>Verified Doctors</p>
                    </div>
                    <div style={styles.heroMiniCard}>
                      <h4 style={styles.heroMiniNumber}>24/7</h4>
                      <p style={styles.heroMiniText}>Digital Access</p>
                    </div>
                    <div style={styles.heroMiniCard}>
                      <h4 style={styles.heroMiniNumber}>100%</h4>
                      <p style={styles.heroMiniText}>Secure Platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={styles.sliderNav}>
            {banners.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  ...styles.dot,
                  background:
                    currentSlide === index
                      ? "linear-gradient(135deg, #ffbe2c, #ffd76a)"
                      : "rgba(255,255,255,0.65)",
                  width: currentSlide === index ? "30px" : "10px"
                }}
              />
            ))}
          </div>
        </section>

        <section style={styles.welcomeSection}>
          <div style={styles.container}>
            <div style={styles.welcomeCard} data-aos="fade-up">
              <div>
                <p style={styles.sectionTag}>Welcome to Smart Healthcare</p>
                <h2 style={styles.sectionTitle}>
                  A premium digital healthcare experience designed for Sri Lanka
                </h2>
                <p style={styles.sectionText}>
                  Our platform combines trusted medical services, modern technology,
                  and a patient-first experience to make healthcare more convenient,
                  secure, and accessible. From booking appointments to video
                  consultations and report management, everything is designed to
                  simplify care for patients and doctors.
                </p>
              </div>

              <div style={styles.statsGrid}>
                {stats.map((item, index) => (
                  <div
                    key={index}
                    style={styles.statBox}
                    data-aos="zoom-in"
                    data-aos-delay={index * 100}
                  >
                    <h3 style={styles.statNumber}>{item.number}</h3>
                    <p style={styles.statLabel}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={styles.servicesSection}>
          <div style={styles.container}>
            <div style={styles.sectionHeading} data-aos="fade-up">
              <p style={styles.sectionTag}>Our Core Services</p>
              <h2 style={styles.sectionTitleCenter}>
                Complete healthcare solutions in one modern platform
              </h2>
              <p style={styles.sectionTextCenter}>
                Designed to support patients, doctors, and administrators with a
                trusted and seamless digital experience.
              </p>
            </div>

            <div style={styles.servicesGrid}>
              {services.map((service, index) => (
                <div
                  key={index}
                  style={styles.serviceCard}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div style={styles.serviceIcon}>
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 style={styles.serviceTitle}>{service.title}</h3>
                  <p style={styles.serviceText}>{service.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.aboutSection}>
          <div style={styles.container}>
            <div style={styles.aboutGrid}>
              <div style={styles.aboutLeft} data-aos="fade-right">
                <p style={styles.sectionTagLight}>Why Patients Choose Us</p>
                <h2 style={styles.aboutTitle}>
                  Trusted care, stronger convenience, better digital healthcare
                </h2>
                <p style={styles.aboutText}>
                  We focus on delivering a professional, secure, and efficient
                  healthcare journey. Patients can manage appointments easily,
                  doctors can organize consultations better, and the full system is
                  built to feel modern, premium, and reliable.
                </p>

                <div style={styles.featureList}>
                  <div style={styles.featureItem}>Fast and simple appointment booking</div>
                  <div style={styles.featureItem}>Secure telemedicine consultations</div>
                  <div style={styles.featureItem}>Protected health data and records</div>
                  <div style={styles.featureItem}>Premium user experience for every device</div>
                </div>
              </div>

              <div style={styles.aboutRight} data-aos="fade-left">
                <p style={styles.sectionTag}>Popular Specialties</p>
                <h3 style={styles.aboutRightTitle}>
                  Find the right specialist for your healthcare needs
                </h3>

                <div style={styles.specialtyWrap}>
                  {specialties.map((item, index) => (
                    <span
                      key={index}
                      style={styles.specialtyPill}
                      data-aos="zoom-in"
                      data-aos-delay={index * 50}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div style={styles.supportBox}>
                  <h4 style={styles.supportTitle}>Better care starts with better access</h4>
                  <p style={styles.supportText}>
                    Whether you need an in-person appointment or a fast online
                    consultation, our system helps you get the care you need without
                    unnecessary delays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.processSection}>
          <div style={styles.container}>
            <div style={styles.sectionHeading} data-aos="fade-up">
              <p style={styles.sectionTag}>How It Works</p>
              <h2 style={styles.sectionTitleCenter}>
                Start your healthcare journey in four simple steps
              </h2>
            </div>

            <div style={styles.stepsGrid}>
              {steps.map((step, index) => (
                <div
                  key={index}
                  style={styles.stepCard}
                  data-aos="fade-up"
                  data-aos-delay={index * 120}
                >
                  <div style={styles.stepNumber}>{step.no}</div>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepText}>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.ctaSection}>
          <div style={styles.container}>
            <div style={styles.ctaCard} data-aos="zoom-in-up">
              <div>
                <p style={styles.sectionTagLight}>Get Started Today</p>
                <h2 style={styles.ctaTitle}>
                  Experience trusted, secure, and convenient healthcare online
                </h2>
                <p style={styles.ctaText}>
                  Join a smarter platform for appointments, telemedicine,
                  prescriptions, reports, and connected healthcare management.
                </p>
              </div>

              <div style={styles.ctaBtnRow}>
                <Link to="/register" style={styles.ctaPrimaryBtn}>
                  Create Account
                </Link>
                <Link to="/appointments" style={styles.ctaSecondaryBtn}>
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

const styles = {
  page: {
    width: "100%",
    backgroundColor: "#f8fbf5",
    fontFamily: "'Archivo', sans-serif"
  },

  container: {
    width: "min(1200px, 92%)",
    margin: "0 auto"
  },

  heroSection: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    overflow: "hidden"
  },

  slideWrapper: {
    position: "absolute",
    inset: 0,
    transition: "opacity 1s ease, visibility 1s ease"
  },

  imageLayer: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    transition: "transform 7s ease"
  },

  overlayDark: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(9, 19, 10, 0.88) 0%, rgba(20, 47, 19, 0.68) 42%, rgba(0,0,0,0.22) 100%)"
  },

  overlayGreen: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(128,195,66,0.10) 0%, rgba(128,195,66,0.04) 60%, rgba(0,0,0,0.08) 100%)"
  },

  overlayGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 35%, rgba(255,190,44,0.16), transparent 28%)"
  },

  heroContentWrap: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "0 8%",
    boxSizing: "border-box"
  },

  heroTextBox: {
    maxWidth: "680px",
    color: "#ffffff"
  },

  badge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 500,
    marginBottom: "18px",
    backdropFilter: "blur(6px)",
    letterSpacing: "0.3px"
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(2.2rem, 4.1vw, 4rem)",
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: "-1px",
    color: "#ffffff",
    textShadow: "0 6px 22px rgba(0,0,0,0.24)",
    maxWidth: "640px"
  },

  titleHighlight: {
    color: "#ffbe2c"
  },

  heroDescription: {
    marginTop: "18px",
    fontSize: "clamp(0.96rem, 1.1vw, 1.05rem)",
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.92)",
    maxWidth: "620px",
    fontWeight: 400
  },

  heroButtons: {
    marginTop: "30px",
    display: "flex",
    gap: "14px",
    flexWrap: "wrap"
  },

  primaryBtn: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #80c342, #5da92e)",
    color: "#fff",
    padding: "14px 26px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "14px",
    boxShadow: "0 14px 30px rgba(0,0,0,0.18)"
  },

  secondaryBtn: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #ffbe2c, #ffd66b)",
    color: "#20301a",
    padding: "14px 26px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "14px",
    boxShadow: "0 14px 30px rgba(0,0,0,0.14)"
  },

  heroMiniStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "28px"
  },

  heroMiniCard: {
    padding: "12px 16px",
    minWidth: "138px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(8px)"
  },

  heroMiniNumber: {
    margin: 0,
    fontSize: "1rem",
    color: "#ffcf59",
    fontWeight: 700,
    marginBottom: "4px"
  },

  heroMiniText: {
    margin: 0,
    fontSize: "0.86rem",
    color: "rgba(255,255,255,0.90)"
  },

  sliderNav: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "34px",
    display: "flex",
    gap: "10px",
    zIndex: 5
  },

  dot: {
    height: "10px",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },

  welcomeSection: {
    marginTop: "-70px",
    position: "relative",
    zIndex: 6,
    paddingBottom: "40px"
  },

  welcomeCard: {
    background: "#ffffff",
    borderRadius: "30px",
    padding: "36px",
    boxShadow: "0 22px 55px rgba(25, 56, 22, 0.12)",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "28px"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px"
  },

  statBox: {
    background: "#f6faef",
    border: "1px solid #e7f1dc",
    borderRadius: "22px",
    padding: "24px"
  },

  statNumber: {
    margin: 0,
    fontSize: "2rem",
    color: "#80c342",
    marginBottom: "8px"
  },

  statLabel: {
    margin: 0,
    color: "#58665b",
    fontWeight: 500,
    lineHeight: 1.6
  },

  sectionHeading: {
    marginBottom: "40px"
  },

  sectionTag: {
    margin: 0,
    color: "#80c342",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
    textAlign: "center"
  },

  sectionTagLight: {
    margin: 0,
    color: "#ffd66b",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px"
  },

  sectionTitle: {
    margin: 0,
    color: "#17311b",
    fontSize: "clamp(2rem, 3vw, 3rem)",
    lineHeight: 1.2,
    marginBottom: "14px"
  },

  sectionTitleCenter: {
    margin: 0,
    color: "#17311b",
    fontSize: "clamp(2rem, 3vw, 2.8rem)",
    lineHeight: 1.2,
    marginBottom: "14px",
    textAlign: "center"
  },

  sectionText: {
    margin: 0,
    color: "#5d6b60",
    lineHeight: 1.9,
    fontSize: "1rem"
  },

  sectionTextCenter: {
    margin: "0 auto",
    maxWidth: "760px",
    color: "#5d6b60",
    lineHeight: 1.9,
    textAlign: "center"
  },

  servicesSection: {
    padding: "50px 0 90px"
  },

  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "22px"
  },

  serviceCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 16px 40px rgba(25, 56, 22, 0.08)",
    border: "1px solid #edf5e7"
  },

  serviceIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #80c342, #a7d86c)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    marginBottom: "18px"
  },

  serviceTitle: {
    margin: 0,
    fontSize: "1.2rem",
    color: "#18311b",
    marginBottom: "12px"
  },

  serviceText: {
    margin: 0,
    lineHeight: 1.85,
    color: "#5e6c61"
  },

  aboutSection: {
    padding: "0 0 90px"
  },

  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "24px"
  },

  aboutLeft: {
    background: "linear-gradient(135deg, #183c1a, #29592b)",
    borderRadius: "30px",
    padding: "36px",
    color: "#ffffff",
    boxShadow: "0 20px 50px rgba(19, 48, 21, 0.18)"
  },

  aboutRight: {
    background: "#ffffff",
    borderRadius: "30px",
    padding: "36px",
    boxShadow: "0 16px 40px rgba(25, 56, 22, 0.08)",
    border: "1px solid #edf5e7"
  },

  aboutTitle: {
    margin: 0,
    fontSize: "clamp(1.9rem, 2.8vw, 2.6rem)",
    lineHeight: 1.2,
    marginBottom: "16px"
  },

  aboutText: {
    margin: 0,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 1.9
  },

  featureList: {
    marginTop: "26px",
    display: "grid",
    gap: "14px"
  },

  featureItem: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "15px 18px",
    borderRadius: "16px"
  },

  aboutRightTitle: {
    margin: 0,
    color: "#17311b",
    fontSize: "1.45rem",
    lineHeight: 1.4,
    marginBottom: "18px"
  },

  specialtyWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px"
  },

  specialtyPill: {
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#f5f9ef",
    border: "1px solid #e2edd5",
    color: "#254920",
    fontSize: "0.95rem",
    fontWeight: 500
  },

  supportBox: {
    background: "linear-gradient(135deg, #fff8e2, #fff1c4)",
    borderRadius: "22px",
    padding: "22px",
    border: "1px solid #ffe19a"
  },

  supportTitle: {
    margin: 0,
    color: "#5e4703",
    marginBottom: "10px",
    fontSize: "1.08rem"
  },

  supportText: {
    margin: 0,
    color: "#6c591a",
    lineHeight: 1.8
  },

  processSection: {
    padding: "0 0 90px"
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "22px"
  },

  stepCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid #edf5e7",
    boxShadow: "0 14px 34px rgba(25, 56, 22, 0.06)"
  },

  stepNumber: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#ffbe2c",
    marginBottom: "12px"
  },

  stepTitle: {
    margin: 0,
    color: "#18311b",
    fontSize: "1.16rem",
    marginBottom: "10px"
  },

  stepText: {
    margin: 0,
    color: "#5e6b61",
    lineHeight: 1.8
  },

  ctaSection: {
    padding: "0 0 100px"
  },

  ctaCard: {
    background: "linear-gradient(135deg, #183c1a, #2d6729)",
    borderRadius: "30px",
    padding: "42px",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap",
    boxShadow: "0 24px 55px rgba(16, 45, 19, 0.2)"
  },

  ctaTitle: {
    margin: 0,
    fontSize: "clamp(2rem, 3vw, 2.8rem)",
    lineHeight: 1.2,
    marginBottom: "12px",
    maxWidth: "760px"
  },

  ctaText: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.9,
    maxWidth: "720px"
  },

  ctaBtnRow: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap"
  },

  ctaPrimaryBtn: {
    textDecoration: "none",
    background: "#ffbe2c",
    color: "#20301a",
    padding: "15px 28px",
    borderRadius: "999px",
    fontWeight: 700
  },

  ctaSecondaryBtn: {
    textDecoration: "none",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    padding: "15px 28px",
    borderRadius: "999px",
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.2)"
  }
};