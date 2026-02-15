import React from 'react';

const Tank = ({ x, y, bodyRotation, turretRotation, color = '#4a90e2', hp = 100, maxHp = 100 }) => {
    return (
        <React.Fragment>
            {/* HP Bar */}
            <div style={{
                position: 'absolute',
                left: x,
                top: y - 50, // Position above the tank
                width: '40px',
                height: '4px',
                backgroundColor: 'red',
                transform: 'translate(-50%, -50%)',
                zIndex: 2
            }}>
                <div style={{
                    width: `${Math.max(0, (hp / maxHp) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#0f0',
                    transition: 'width 0.2s'
                }} />
            </div>

            <div style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${bodyRotation}deg)`,
                width: '40px',
                height: '60px',
                backgroundColor: color,
                border: '2px solid #333',
                zIndex: 1,
                boxShadow: '0 0 5px rgba(0,0,0,0.5)'
            }}>
                {/* Tracks */}
                <div style={{ position: 'absolute', top: 0, left: -5, width: '4px', height: '100%', backgroundColor: '#555' }}></div>
                <div style={{ position: 'absolute', top: 0, right: -5, width: '4px', height: '100%', backgroundColor: '#555' }}></div>

                {/* Turret */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '10px',
                    height: '40px',
                    backgroundColor: '#333',
                    transformOrigin: '50% 100%', // Rotate around the base
                    transform: `translate(-50%, -100%) rotate(${turretRotation - bodyRotation}deg)`
                    // Note: turretRotation is global, but it's inside the body which is already rotated.
                    // So we need to subtract bodyRotation to make it independent?
                    // Wait, if I rotate the parent, the child rotates with it.
                    // If I want the turret to point at absolute angle T, and body is at B.
                    // The child rotation relative to parent should be T - B.
                }} />
            </div>
        </React.Fragment>
    );
};

export default Tank;
