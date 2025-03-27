import Link from 'next/link';

const Header = () => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Eco Track</h1>
      <nav>
        <ul style={styles.navList}>
          <li style={styles.navItem}>
            <Link href="/">ínicio</Link>
          </li>
          <li style={styles.navItem}>
            <Link href="/about">Sobre</Link>
          </li>
          <li style={styles.navItem}>
            <Link href="/services">Serviços</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    margin: 0,
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    margin: 0,
    padding: 0,
  },
  navItem: {
    margin: '0 10px',
  },
};

export default Header;
