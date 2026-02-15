import React, { useState, useEffect } from 'react';
import { useGameAuth } from '../utilities/game-auth-provider';

export default function MarketplacePanel() {
    const { user, refreshUser } = useGameAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('ALL');
    const [selectedListing, setSelectedListing] = useState(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetchListings();
    }, [category]);
    
    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const url = category === 'ALL' 
                ? '/api/economy/marketplace'
                : `/api/economy/marketplace?category=${category}`;
                
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setListings(data.listings || []);
            } else {
                setError(data.message || 'Eroare la încărcarea pieței');
            }
        } catch (err) {
            setError('Eroare de rețea');
            console.error('Marketplace fetch error:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const handlePurchase = (listing) => {
        setSelectedListing(listing);
        setShowPurchaseModal(true);
    };
    
    if (loading) {
        return (
            <div className="marketplace-panel glass-panel">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Se încarcă piața...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="marketplace-panel glass-panel">
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchListings}>Reîncearcă</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="marketplace-panel glass-panel">
            <div className="panel-header">
                <h2>🏪 Piața Globală</h2>
                <div className="user-balance">
                    <span>Balanță: €{parseFloat(user?.balance_euro || 0).toFixed(4)}</span>
                </div>
            </div>
            
            <div className="category-tabs">
                <button 
                    className={category === 'ALL' ? 'active' : ''}
                    onClick={() => setCategory('ALL')}
                >
                    Toate
                </button>
                <button 
                    className={category === 'FOOD' ? 'active' : ''}
                    onClick={() => setCategory('FOOD')}
                >
                    🍞 Mâncare
                </button>
                <button 
                    className={category === 'ENTERTAINMENT' ? 'active' : ''}
                    onClick={() => setCategory('ENTERTAINMENT')}
                >
                    📰 Divertisment
                </button>
            </div>
            
            {listings.length === 0 ? (
                <div className="empty-state">
                    <p>🏪 Nu există oferte disponibile</p>
                    <p>Verifică mai târziu pentru noi produse!</p>
                </div>
            ) : (
                <div className="listings-grid">
                    {listings.map(listing => (
                        <ListingCard
                            key={listing._id}
                            listing={listing}
                            onPurchase={handlePurchase}
                            userBalance={user?.balance_euro}
                        />
                    ))}
                </div>
            )}
            
            {showPurchaseModal && selectedListing && (
                <PurchaseModal
                    listing={selectedListing}
                    onClose={() => {
                        setShowPurchaseModal(false);
                        setSelectedListing(null);
                    }}
                    onSuccess={() => {
                        fetchListings();
                        refreshUser();
                    }}
                />
            )}
        </div>
    );
}

function ListingCard({ listing, onPurchase, userBalance }) {
    const basePrice = parseFloat(listing.price_per_unit_euro);
    const vat = basePrice * 0.10;
    const priceWithVAT = (basePrice + vat).toFixed(4);
    const canAfford = parseFloat(userBalance || 0) >= parseFloat(priceWithVAT);
    
    const details = listing.item_details || {};
    
    return (
        <div className="listing-card">
            <div className="seller-badge">{listing.seller_name || 'Unknown Seller'}</div>
            
            <div className="item-info">
                <div className="item-name">{details.name || 'Unknown Item'}</div>
                <span className="quality-badge">Q{listing.quality}</span>
            </div>
            
            <div className="item-effects">
                {details.energy_restore > 0 && (
                    <div className="effect">⚡ +{details.energy_restore}</div>
                )}
                {details.happiness_restore > 0 && (
                    <div className="effect">😊 +{details.happiness_restore}</div>
                )}
            </div>
            
            <div className="price-info">
                <div className="price-row">
                    <span>Preț:</span>
                    <span>€{basePrice.toFixed(4)}</span>
                </div>
                <div className="price-row vat">
                    <span>TVA (10%):</span>
                    <span>€{vat.toFixed(4)}</span>
                </div>
                <div className="price-row total">
                    <span>Total:</span>
                    <span>€{priceWithVAT}</span>
                </div>
            </div>
            
            <div className="quantity">Disponibil: {listing.quantity}</div>
            
            <button
                className={`buy-btn ${canAfford ? '' : 'disabled'}`}
                onClick={() => onPurchase(listing)}
                disabled={!canAfford}
            >
                {canAfford ? 'Cumpără' : 'Fonduri Insuficiente'}
            </button>
        </div>
    );
}

function PurchaseModal({ listing, onClose, onSuccess }) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const basePrice = parseFloat(listing.price_per_unit_euro);
    const totalBase = basePrice * quantity;
    const totalVAT = totalBase * 0.10;
    const totalWithVAT = totalBase + totalVAT;
    
    const handlePurchase = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/economy/marketplace/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    listing_id: listing._id,
                    quantity: quantity.toString()
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.message || 'Eroare la achiziție');
            }
        } catch (err) {
            setError('Eroare de rețea');
            console.error('Purchase error:', err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content purchase-modal" onClick={e => e.stopPropagation()}>
                <h3>Cumpără {listing.item_details?.name}</h3>
                
                <div className="purchase-details">
                    <div className="detail-row">
                        <span>Vânzător:</span>
                        <span>{listing.seller_name}</span>
                    </div>
                    <div className="detail-row">
                        <span>Calitate:</span>
                        <span>Q{listing.quality}</span>
                    </div>
                    <div className="detail-row">
                        <span>Disponibil:</span>
                        <span>{listing.quantity}</span>
                    </div>
                </div>
                
                <div className="quantity-selector">
                    <label>Cantitate:</label>
                    <input
                        type="number"
                        min="1"
                        max={listing.quantity}
                        value={quantity}
                        onChange={e => setQuantity(Math.max(1, Math.min(listing.quantity, parseInt(e.target.value) || 1)))}
                    />
                </div>
                
                <div className="price-breakdown">
                    <div className="price-row">
                        <span>Preț unitar:</span>
                        <span>€{basePrice.toFixed(4)}</span>
                    </div>
                    <div className="price-row">
                        <span>Subtotal ({quantity}×):</span>
                        <span>€{totalBase.toFixed(4)}</span>
                    </div>
                    <div className="price-row">
                        <span>TVA (10%):</span>
                        <span>€{totalVAT.toFixed(4)}</span>
                    </div>
                    <div className="price-row total">
                        <span>Total de plată:</span>
                        <span>€{totalWithVAT.toFixed(4)}</span>
                    </div>
                </div>
                
                {error && (
                    <div className="error-message">
                        ❌ {error}
                    </div>
                )}
                
                <div className="modal-actions">
                    <button onClick={onClose} disabled={loading}>Anulează</button>
                    <button 
                        onClick={handlePurchase}
                        disabled={loading}
                        className="primary"
                    >
                        {loading ? 'Se procesează...' : 'Confirmă Achiziția'}
                    </button>
                </div>
            </div>
        </div>
    );
}
