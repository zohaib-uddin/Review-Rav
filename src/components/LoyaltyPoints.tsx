import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Gift, Star } from 'lucide-react';

interface LoyaltyPointsProps {
  userId?: string;
}

interface LoyaltyData {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalSpent: number;
  nextTierPoints: number;
  nextTierName: string;
}

export default function LoyaltyPoints({ userId }: LoyaltyPointsProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData>({
    points: 0,
    tier: 'Bronze',
    totalSpent: 0,
    nextTierPoints: 1000,
    nextTierName: 'Silver',
  });
  const [showRedeem, setShowRedeem] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    // For demo, use localStorage
    const stored = localStorage.getItem('loyaltyPoints');
    if (stored) {
      setLoyaltyData(JSON.parse(stored));
    } else {
      // Initialize with sample data
      const initialData: LoyaltyData = {
        points: 250,
        tier: 'Bronze',
        totalSpent: 2500,
        nextTierPoints: 1000,
        nextTierName: 'Silver',
      };
      setLoyaltyData(initialData);
      localStorage.setItem('loyaltyPoints', JSON.stringify(initialData));
    }
  }, [userId]);

  const handleRedeemPoints = (pointsToRedeem: number) => {
    if (loyaltyData.points >= pointsToRedeem) {
      const updatedData = {
        ...loyaltyData,
        points: loyaltyData.points - pointsToRedeem,
      };
      setLoyaltyData(updatedData);
      localStorage.setItem('loyaltyPoints', JSON.stringify(updatedData));
      setShowRedeem(false);
      alert(`Successfully redeemed ${pointsToRedeem} points for Rs. ${pointsToRedeem / 10} discount!`);
    }
  };

  const tierColors = {
    Bronze: 'from-amber-600 to-amber-800',
    Silver: 'from-gray-400 to-gray-600',
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-purple-400 to-purple-600',
  };

  const tierIcons = {
    Bronze: Award,
    Silver: Star,
    Gold: Star,
    Platinum: Gift,
  };

  const TierIcon = tierIcons[loyaltyData.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-gradient-to-br ${tierColors[loyaltyData.tier]} rounded-full`}>
            <TierIcon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold">{loyaltyData.tier} Member</h3>
            <p className="text-sm text-white/80">{loyaltyData.points} points</p>
          </div>
        </div>
        <button
          onClick={() => setShowRedeem(!showRedeem)}
          className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold hover:bg-white/30 transition-colors"
        >
          Redeem
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>{loyaltyData.tier}</span>
          <span>{loyaltyData.nextTierName}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(loyaltyData.points / loyaltyData.nextTierPoints) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <p className="text-xs mt-1 text-white/80">
          {loyaltyData.nextTierPoints - loyaltyData.points} points to {loyaltyData.nextTierName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <p className="text-xs text-white/80">Total Spent</p>
          <p className="text-lg font-bold">Rs. {loyaltyData.totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <p className="text-xs text-white/80">Points Value</p>
          <p className="text-lg font-bold">Rs. {(loyaltyData.points / 10).toLocaleString()}</p>
        </div>
      </div>

      {/* Redeem Options */}
      {showRedeem && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <h4 className="font-bold mb-3">Redeem Points</h4>
          <div className="space-y-2">
            {[500, 1000, 2000, 5000].map(points => (
              <button
                key={points}
                onClick={() => handleRedeemPoints(points)}
                disabled={loyaltyData.points < points}
                className="w-full flex items-center justify-between p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium">{points} points</span>
                <span className="text-sm">Rs. {points / 10} off</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Benefits */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <h4 className="font-bold mb-2 text-sm">Your Benefits</h4>
        <ul className="text-xs space-y-1 text-white/80">
          <li>✓ Earn 1 point per Rs. 10 spent</li>
          <li>✓ Birthday bonus points</li>
          <li>✓ Early access to sales</li>
          <li>✓ Free shipping on orders over Rs. 3000</li>
        </ul>
      </div>
    </motion.div>
  );
}
