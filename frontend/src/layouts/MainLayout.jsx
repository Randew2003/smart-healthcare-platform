import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Header />
      <main style={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0
  },
  main: {
    flex: 1,
    width: "100%",
    margin: 0,
    padding: 0
  }
};