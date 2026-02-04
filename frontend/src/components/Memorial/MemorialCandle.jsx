import { useState } from 'react';
import './MemorialCandle.css';

const MemorialCandle = ({ count = 0, onLightIncense, memberName }) => {
    const [isLighting, setIsLighting] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);

    const handleLightIncense = async () => {
        setIsLighting(true);
        setShowAnimation(true);

        if (onLightIncense) {
            await onLightIncense();
        }

        setTimeout(() => setIsLighting(false), 1000);
        setTimeout(() => setShowAnimation(false), 5000);
    };

    return (
        <div className="memorial-candle-container">
            {/* Incense sticks */}
            <div className="incense-holder">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`incense-stick ${showAnimation ? 'burning' : ''}`}>
                        <div className="incense-glow"></div>
                        <div className="incense-smoke">
                            <div className="smoke-particle"></div>
                            <div className="smoke-particle"></div>
                            <div className="smoke-particle"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Light incense button */}
            <button
                className={`incense-button ${isLighting ? 'lighting' : ''}`}
                onClick={handleLightIncense}
                disabled={isLighting}
            >
                <span className="incense-icon">🕯️</span>
                <span>Thắp hương ảo</span>
            </button>

            {/* Incense count */}
            <div className="incense-count">
                <span className="count-number">{count.toLocaleString()}</span>
                <span className="count-label">nén hương đã được thắp</span>
            </div>

            {/* Success message */}
            {showAnimation && (
                <div className="incense-message">
                    <span>🙏 Đã thắp hương cho {memberName || 'người đã khuất'}</span>
                </div>
            )}
        </div>
    );
};

export default MemorialCandle;
