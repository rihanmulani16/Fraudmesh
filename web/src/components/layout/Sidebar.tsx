import { useLocation, Link } from 'react-router-dom';
import { Shield, AlertTriangle, FileCheck, BarChart3, Play, User, Activity } from 'lucide-react';
import { useFraudMesh } from '../../context/FraudMeshContext';

export default function Sidebar() {
  const location = useLocation();
  const { rings, simulation } = useFraudMesh();
  const newRingsCount = rings.filter(r => r.status === 'new').length;

  const navItems = [
    { path: '/', label: 'Ring queue', icon: AlertTriangle, badge: newRingsCount },
    { path: '/cases', label: 'Closed cases', icon: FileCheck },
    { path: '/trust', label: 'Trust & evaluation', icon: BarChart3 },
    { path: '/simulate', label: 'Simulate & twin', icon: Play },
  ];

  return (
    <aside style={{
      width: 260,
      minHeight: '100vh',
      background: '#0a0f1a',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
          }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e6edf5', letterSpacing: '-0.02em' }}>
              FraudMesh
            </div>
            <div style={{ fontSize: '0.7rem', color: '#566577', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              ANALYTICS CONSOLE
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 6,
                marginBottom: 4,
                color: isActive ? '#06b6d4' : '#8899aa',
                background: isActive ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.2s',
              }}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 10,
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status indicator */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px',
          background: 'var(--bg-surface)',
          borderRadius: 6,
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#e6edf5' }}>Federation active</div>
            <div style={{ fontSize: '0.7rem', color: '#566577', fontFamily: 'var(--font-mono)' }}>4 banks connected</div>
          </div>
        </div>
      </div>

      {/* Analyst */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={16} color="#8899aa" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#e6edf5' }}>Analyst Asha</div>
            <div style={{ fontSize: '0.7rem', color: '#566577' }}>Bank A · Fraud Team</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
