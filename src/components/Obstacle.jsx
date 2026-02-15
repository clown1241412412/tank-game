import React from 'react';

const Obstacle = ({ x, y, size }) => {
    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid #8e44ad`, // Purple triangle
            transform: 'translate(-50%, -50%)',
            zIndex: 1 // Same level as tanks
        }} />
    );
};

export default Obstacle;
