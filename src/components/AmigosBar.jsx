import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

function AmigosBar() {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '0vh',
      }}
    >
      <header
        style={{
          backgroundColor: '#1876d1',
          color: 'white',
          padding: '0px 0',
          marginBottom: '20px',
          fontSize: '2em',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <li style={{ marginLeft: '40px' }}>
            <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>
              <Icon icon="mdi-light:home" />
            </Link>
          </li>
        </ul>
        <div style={{ flex: 1, textAlign: 'center' }}>Three Amigos Search Engine</div>
      </header>
    </div>
  );
}

export default AmigosBar