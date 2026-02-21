import React, { useState, useEffect } from 'react';
import { useGameAuth } from '../utilities/game-auth-provider';
import { convertDecimals } from '../../utilities/decimal-utils';

export default function InventoryPanel() {
	const { user } = useGameAuth();
	const [inventory, setInventory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('ALL');
	const [sortBy, setSortBy] = useState('acquired_desc');
	const [selectedItem, setSelectedItem] = useState(null);
	const [showConsumeModal, setShowConsumeModal] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchInventory();
	}, []);

	const fetchInventory = async () => {
		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem('accessToken');
			const response = await fetch('/api/economy/inventory', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();

			// Convert all Decimal128 values to numbers
			const convertedData = convertDecimals(data);

			if (convertedData.success) {
				setInventory(convertedData.inventory || []);
			} else {
				setError(convertedData.message || 'Eroare la încărcarea inventarului');
			}
		} catch (err) {
			setError('Eroare de rețea');
			console.error('Inventory fetch error:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleConsume = (item) => {
		setSelectedItem(item);
		setShowConsumeModal(true);
	};

	const calculateTotalValue = () => {
		return inventory
			.reduce((total, item) => {
				const itemValue = parseFloat(item.item_details?.base_price_euro || 0);
				return total + itemValue * item.quantity;
			}, 0)
			.toFixed(2);
	};

	const filteredInventory = inventory.filter((item) => {
		if (filter === 'ALL') return true;
		return item.item_details?.category === filter;
	});

	if (loading) {
		return (
			<div className="inventory-panel glass-panel">
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Se încarcă inventarul...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="inventory-panel glass-panel">
				<div className="error-state">
					<p>❌ {error}</p>
					<button onClick={fetchInventory}>Reîncearcă</button>
				</div>
			</div>
		);
	}

	return (
		<div className="inventory-panel glass-panel">
			<div className="panel-header">
				<h2>📦 Inventarul Meu</h2>
				<div className="inventory-stats">
					<span>Total Iteme: {inventory.length}</span>
					<span>Valoare: €{calculateTotalValue()}</span>
				</div>
			</div>

			<div className="filter-bar">
				<button
					className={filter === 'ALL' ? 'active' : ''}
					onClick={() => setFilter('ALL')}
				>
					Toate
				</button>
				<button
					className={filter === 'FOOD' ? 'active' : ''}
					onClick={() => setFilter('FOOD')}
				>
					🍞 Mâncare
				</button>
				<button
					className={filter === 'ENTERTAINMENT' ? 'active' : ''}
					onClick={() => setFilter('ENTERTAINMENT')}
				>
					📰 Divertisment
				</button>
			</div>

			{filteredInventory.length === 0 ? (
				<div className="empty-state">
					<p>📭 Inventarul tău este gol</p>
					<p>Cumpără iteme din Piață pentru a le vedea aici!</p>
				</div>
			) : (
				<div className="inventory-grid">
					{filteredInventory.map((item) => (
						<ItemCard key={item._id} item={item} onConsume={handleConsume} />
					))}
				</div>
			)}

			{showConsumeModal && selectedItem && (
				<ConsumptionModal
					item={selectedItem}
					onClose={() => {
						setShowConsumeModal(false);
						setSelectedItem(null);
					}}
					onSuccess={fetchInventory}
				/>
			)}
		</div>
	);
}

function ItemCard({ item, onConsume }) {
	const effects = item.calculated_effects || {};
	const details = item.item_details || {};

	return (
		<div className="item-card">
			<div className="item-header">
				<span className="item-name">{details.name || 'Unknown Item'}</span>
				<span className="quality-badge">Q{item.quality}</span>
			</div>

			<div className="item-quantity">×{item.quantity}</div>

			<div className="item-effects">
				{effects.energy_restore > 0 && (
					<div className="effect energy">⚡ +{effects.energy_restore}</div>
				)}
				{effects.happiness_restore > 0 && (
					<div className="effect happiness">
						😊 +{effects.happiness_restore}
					</div>
				)}
			</div>

			{details.is_consumable && (
				<button className="consume-btn" onClick={() => onConsume(item)}>
					Consumă
				</button>
			)}
		</div>
	);
}

function ConsumptionModal({ item, onClose, onSuccess }) {
	const { user, refreshUser } = useGameAuth();
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleConsume = async () => {
		setLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem('accessToken');
			const response = await fetch('/api/economy/consume', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					item_code: item.item_code,
					quality: item.quality,
					quantity: quantity.toString(),
				}),
			});

			const data = await response.json();

			if (data.success) {
				await refreshUser();
				onSuccess();
				onClose();
			} else {
				setError(data.message || 'Eroare la consum');
			}
		} catch (err) {
			setError('Eroare de rețea');
			console.error('Consumption error:', err);
		} finally {
			setLoading(false);
		}
	};

	const effects = item.calculated_effects || {};
	const energyAfter = Math.min(
		100,
		(user?.energy || 0) + (effects.energy_restore || 0) * quantity,
	);
	const happinessAfter = Math.min(
		100,
		(user?.happiness || 0) + (effects.happiness_restore || 0) * quantity,
	);

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content consumption-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<h3>Consumă {item.item_details?.name}</h3>

				<div className="current-stats">
					<div className="stat">
						<span>⚡ Energie:</span>
						<span>{user?.energy || 0}/100</span>
					</div>
					<div className="stat">
						<span>😊 Fericire:</span>
						<span>{user?.happiness || 0}/100</span>
					</div>
				</div>

				<div className="effect-preview">
					<h4>Efecte:</h4>
					{effects.energy_restore > 0 && (
						<div className="effect">
							⚡ Energie: {user?.energy || 0} → {energyAfter} (+
							{effects.energy_restore * quantity})
						</div>
					)}
					{effects.happiness_restore > 0 && (
						<div className="effect">
							😊 Fericire: {user?.happiness || 0} → {happinessAfter} (+
							{effects.happiness_restore * quantity})
						</div>
					)}
				</div>

				<div className="quantity-selector">
					<label>Cantitate:</label>
					<input
						type="number"
						min="1"
						max={item.quantity}
						value={quantity}
						onChange={(e) =>
							setQuantity(
								Math.max(
									1,
									Math.min(item.quantity, parseInt(e.target.value) || 1),
								),
							)
						}
					/>
				</div>

				{error && <div className="error-message">❌ {error}</div>}

				<div className="modal-actions">
					<button onClick={onClose} disabled={loading}>
						Anulează
					</button>
					<button
						onClick={handleConsume}
						disabled={loading}
						className="primary"
					>
						{loading ? 'Se procesează...' : 'Confirmă'}
					</button>
				</div>
			</div>
		</div>
	);
}
