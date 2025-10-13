import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button, Text } from '@radix-ui/themes';

const PACKAGE_ID = '0x58bdb3c9bd2d41c26b85131798d421fff9a9de89ccd82b007ccac144c3114313';

export function InitializeRegistry() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);

  const initializeRegistry = () => {
    if (!account) return;
    
    setLoading(true);
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::swiftgig::initialize_registry`,
      arguments: [],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          console.error('Error initializing registry:', err);
          setLoading(false);
          alert('Failed to initialize registry');
        },
        onSuccess: (result) => {
          console.log('Registry initialized successfully:', result);
          setLoading(false);
          alert('Registry initialized successfully!');
        },
      }
    );
  };

  if (!account) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <Text size="4" style={{ color: '#e2e8f0', marginBottom: '8px' }}>
          Wallet Connection Required
        </Text>
        <Text size="2" color="gray">
          Please connect your wallet to initialize the registry
        </Text>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #0d1b2a 50%, #1b263b 75%, #0f1419 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(10, 14, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: '32px',
              color: '#e2e8f0',
              marginBottom: '12px',
              fontWeight: '700'
            }}>
              Initialize SwiftGig Registry
            </h1>
            <Text size="2" style={{ color: 'rgba(147, 197, 253, 0.8)' }}>
              This action will create the main registry for the SwiftGig platform
            </Text>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <Text size="2" style={{ color: '#93c5fd', lineHeight: '1.6' }}>
              ⚠️ <strong>Important:</strong> This should only be done once when deploying the platform. 
              The registry will store all talent profiles, client profiles, and gig information.
            </Text>
          </div>

          <Button
            size="4"
            onClick={initializeRegistry}
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? 'rgba(59, 130, 246, 0.3)'
                : 'linear-gradient(135deg, #60a5fa, #a855f7)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading
                ? 'none'
                : '0 8px 32px rgba(59, 130, 246, 0.3)'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Initializing...
              </div>
            ) : (
              '🚀 Initialize Registry'
            )}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}