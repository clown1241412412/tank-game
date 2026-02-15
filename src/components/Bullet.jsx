import React from 'react';

const Bullet = ({ x, y, rotation, color = '#e74c3c' }) => {
    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            width: '6px',
            height: '10px',
            backgroundColor: color,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            zIndex: 0
        }} />
    );
};

export default Bullet;
