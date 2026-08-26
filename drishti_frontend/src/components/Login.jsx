import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Radar,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Terminal
} from 'lucide-react';


export default function Login() {

  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('test1234');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setLoading(true);

    const result = await login(username, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }

  };


  const handleQuickDemoFill = () => {

    setUsername('admin');
    setPassword('test1234');

  };


  return (

    <div
      style={{

        minHeight: '100vh',
        width: '100vw',

        background:
          'radial-gradient(ellipse at 50% 20%, #0f172a 0%, #060913 100%)',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        position: 'relative',

        overflow: 'hidden',

        fontFamily:
          'var(--font-sans, system-ui, sans-serif)',

        color: '#f8fafc'

      }}
    >

      {/* Background Grid */}

      <div
        style={{

          position: 'absolute',

          inset: 0,

          backgroundImage: `
            linear-gradient(
              to right,
              rgba(14, 165, 233, 0.05) 1px,
              transparent 1px
            ),

            linear-gradient(
              to bottom,
              rgba(14, 165, 233, 0.05) 1px,
              transparent 1px
            )
          `,

          backgroundSize: '40px 40px',

          pointerEvents: 'none'

        }}
      />


      {/* Glowing Background */}

      <div
        style={{

          position: 'absolute',

          width: '600px',

          height: '600px',

          borderRadius: '50%',

          background:
            'radial-gradient(circle, rgba(0, 243, 255, 0.12) 0%, rgba(14, 165, 233, 0.02) 60%, transparent 80%)',

          filter: 'blur(40px)',

          pointerEvents: 'none',

          animation:
            'pulse 6s ease-in-out infinite alternate'

        }}
      />


      {/* MAIN LOGIN CARD */}

      <div
        style={{

          position: 'relative',

          zIndex: 10,

          width: '100%',

          maxWidth: '460px',

          margin: '20px',

          background:
            'rgba(15, 23, 42, 0.85)',

          backdropFilter:
            'blur(24px)',

          border:
            '1px solid rgba(0, 243, 255, 0.25)',

          borderRadius: '20px',

          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 243, 255, 0.15)',

          overflow: 'hidden'

        }}
      >

        {/* TOP HEADER BAR */}

        <div
          style={{

            height: '4px',

            background:
              'linear-gradient(90deg, #00f3ff, #0284c7, #38bdf8)'

          }}
        />


        <div
          style={{
            padding: '36px 32px 32px'
          }}
        >

          {/* BRANDING */}

          <div
            style={{

              textAlign: 'center',

              marginBottom: '28px'

            }}
          >

            <div
              style={{

                width: '64px',

                height: '64px',

                margin: '0 auto 16px',

                borderRadius: '16px',

                background:
                  'linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(14, 165, 233, 0.4))',

                border:
                  '1px solid rgba(0, 243, 255, 0.4)',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                boxShadow:
                  '0 0 20px rgba(0, 243, 255, 0.3)'

              }}
            >

              <Radar
                size={32}
                color="#00f3ff"
              />

            </div>


            <div
              style={{

                display: 'inline-block',

                padding: '4px 12px',

                borderRadius: '9999px',

                background:
                  'rgba(0, 243, 255, 0.1)',

                border:
                  '1px solid rgba(0, 243, 255, 0.3)',

                fontSize: '11px',

                fontWeight: 700,

                letterSpacing: '0.1em',

                color: '#00f3ff',

                marginBottom: '10px',

                textTransform: 'uppercase'

              }}
            >

              Official Command Portal

            </div>


            <h1
              style={{

                fontSize: '24px',

                fontWeight: 800,

                letterSpacing: '-0.02em',

                color: '#ffffff',

                margin: '0 0 6px'

              }}
            >

              D.R.I.S.H.T.I.

            </h1>


            <p
              style={{

                fontSize: '12px',

                color: '#94a3b8',

                margin: 0,

                letterSpacing: '0.02em'

              }}
            >

              Disaster Early Warning & Logistics Command

            </p>

          </div>


          {/* DEMO CREDENTIALS */}

          <div
            onClick={handleQuickDemoFill}

            style={{

              marginBottom: '20px',

              padding: '10px 14px',

              background:
                'rgba(2, 132, 199, 0.12)',

              border:
                '1px solid rgba(14, 165, 233, 0.3)',

              borderRadius: '10px',

              cursor: 'pointer',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'space-between',

              transition:
                'all 0.2s ease'

            }}

            title="Click to auto-fill evaluation credentials"
          >

            <div
              style={{

                display: 'flex',

                alignItems: 'center',

                gap: '8px'

              }}
            >

              <Terminal
                size={14}
                color="#38bdf8"
              />

              <span
                style={{

                  fontSize: '11px',

                  color: '#bae6fd',

                  fontFamily:
                    'var(--font-mono, monospace)'

                }}
              >

                Demo:
                {' '}
                <strong>admin</strong>
                {' / '}
                <strong>test1234</strong>

              </span>

            </div>


            <span
              style={{

                fontSize: '10px',

                color: '#00f3ff',

                fontWeight: 600

              }}
            >

              Fill

            </span>

          </div>


          {/* ERROR MESSAGE */}

          {error && (

            <div
              style={{

                marginBottom: '20px',

                padding: '12px 14px',

                background:
                  'rgba(220, 38, 38, 0.15)',

                border:
                  '1px solid rgba(239, 68, 68, 0.4)',

                borderRadius: '10px',

                display: 'flex',

                alignItems: 'center',

                gap: '10px',

                fontSize: '12px',

                color: '#fca5a5'

              }}
            >

              <AlertCircle
                size={16}
                color="#ef4444"
                style={{
                  flexShrink: 0
                }}
              />

              <span>
                {error}
              </span>

            </div>

          )}


          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}

            style={{

              display: 'flex',

              flexDirection: 'column',

              gap: '16px'

            }}
          >

            {/* USERNAME */}

            <div>

              <label
                style={{

                  display: 'block',

                  fontSize: '11px',

                  fontWeight: 600,

                  textTransform: 'uppercase',

                  letterSpacing: '0.05em',

                  color: '#94a3b8',

                  marginBottom: '6px'

                }}
              >

                Command Operator ID

              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <Mail
                  size={16}
                  color="#64748b"

                  style={{

                    position: 'absolute',

                    left: '12px',

                    top: '50%',

                    transform:
                      'translateY(-50%)'

                  }}
                />


                <input

                  type="text"

                  value={username}

                  onChange={(e) =>
                    setUsername(e.target.value)
                  }

                  required

                  placeholder="Enter command operator ID"

                  style={{

                    width: '100%',

                    padding:
                      '12px 12px 12px 38px',

                    background:
                      'rgba(30, 41, 59, 0.7)',

                    border:
                      '1px solid rgba(71, 85, 105, 0.6)',

                    borderRadius: '10px',

                    color: '#ffffff',

                    fontSize: '13px',

                    outline: 'none',

                    transition:
                      'all 0.2s ease',

                    boxSizing:
                      'border-box'

                  }}

                  onFocus={(e) =>
                    e.target.style.borderColor =
                      '#00f3ff'
                  }

                  onBlur={(e) =>
                    e.target.style.borderColor =
                      'rgba(71, 85, 105, 0.6)'
                  }

                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label
                style={{

                  display: 'block',

                  fontSize: '11px',

                  fontWeight: 600,

                  textTransform: 'uppercase',

                  letterSpacing: '0.05em',

                  color: '#94a3b8',

                  marginBottom: '6px'

                }}
              >

                Security Key / Password

              </label>


              <div
                style={{
                  position: 'relative'
                }}
              >

                <Lock
                  size={16}

                  color="#64748b"

                  style={{

                    position: 'absolute',

                    left: '12px',

                    top: '50%',

                    transform:
                      'translateY(-50%)'

                  }}
                />


                <input

                  type="password"

                  value={password}

                  onChange={(e) =>
                    setPassword(e.target.value)
                  }

                  required

                  placeholder="••••••••••••"

                  style={{

                    width: '100%',

                    padding:
                      '12px 12px 12px 38px',

                    background:
                      'rgba(30, 41, 59, 0.7)',

                    border:
                      '1px solid rgba(71, 85, 105, 0.6)',

                    borderRadius: '10px',

                    color: '#ffffff',

                    fontSize: '13px',

                    outline: 'none',

                    transition:
                      'all 0.2s ease',

                    boxSizing:
                      'border-box'

                  }}

                  onFocus={(e) =>
                    e.target.style.borderColor =
                      '#00f3ff'
                  }

                  onBlur={(e) =>
                    e.target.style.borderColor =
                      'rgba(71, 85, 105, 0.6)'
                  }

                />

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button

              type="submit"

              disabled={loading}

              style={{

                marginTop: '8px',

                width: '100%',

                padding: '13px 20px',

                background:
                  'linear-gradient(135deg, #0284c7, #00f3ff)',

                color: '#04101d',

                border: 'none',

                borderRadius: '10px',

                fontSize: '14px',

                fontWeight: 700,

                letterSpacing: '0.02em',

                cursor:
                  loading
                    ? 'not-allowed'
                    : 'pointer',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                gap: '8px',

                boxShadow:
                  '0 4px 15px rgba(0, 243, 255, 0.35)',

                transition:
                  'all 0.2s ease',

                opacity:
                  loading
                    ? 0.7
                    : 1

              }}
            >

              {loading ? (

                <span>
                  Authenticating Clearance...
                </span>

              ) : (

                <>

                  <span>
                    Authenticate & Launch Command
                  </span>

                  <ArrowRight
                    size={16}
                  />

                </>

              )}

            </button>

          </form>


          {/* FOOTER */}

          <div
            style={{

              marginTop: '28px',

              paddingTop: '18px',

              borderTop:
                '1px solid rgba(255, 255, 255, 0.08)',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '16px',

              fontSize: '10px',

              color: '#64748b'

            }}
          >

            <div
              style={{

                display: 'flex',

                alignItems: 'center',

                gap: '4px'

              }}
            >

              <Shield
                size={12}
                color="#10b981"
              />

              <span>
                JWT Encrypted RBAC
              </span>

            </div>


            <span>
              •
            </span>


            <div
              style={{

                display: 'flex',

                alignItems: 'center',

                gap: '4px'

              }}
            >

              <CheckCircle2
                size={12}
                color="#38bdf8"
              />

              <span>
                ISRO-SOI Compliant
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}