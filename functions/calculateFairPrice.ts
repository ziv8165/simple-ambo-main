import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// --- CONFIGURATION ---
const PRICING_CONFIG = {
    zones: {
        "tlv_heart": { base_rent: 3800 }, // לב העיר
        "old_north": { base_rent: 3500 }, // צפון ישן
        "ramat_aviv": { base_rent: 3000 }, // רמת אביב
        "south_jaffa": { base_rent: 2600 } // פלורנטין/דרום
    },
    multipliers: {
        "studio": 1.60,
        "luxury_penthouse": 1.40,
        "standard_apt": 1.0,
        "shared_room": 0.7, // Added explicit multiplier for shared room
        "parking": 0.03, // +3%
        "renovated": 0.10 // +10%
    },
    seasonality: {
        high_months: [0, 1, 6, 7], // Jan, Feb, Jul, Aug (JS months 0-11)
        high_factor: 1.40,
        normal_factor: 1.25
    }
};

// --- CORE FUNCTION 1: ESTIMATE RENT ---
function estimateMonthlyRent(input) {
    // Default to south_jaffa if zone invalid, to prevent crashes, but ideally should be valid.
    const zoneConfig = PRICING_CONFIG.zones[input.zoneId] || PRICING_CONFIG.zones["south_jaffa"];
    const base = zoneConfig.base_rent * (input.rooms || 1);
    
    let factor = PRICING_CONFIG.multipliers[input.assetType] || 1.0;
    
    let premium = 1.0;
    if (input.features?.has_parking) premium += PRICING_CONFIG.multipliers.parking;
    if (input.features?.is_renovated) premium += PRICING_CONFIG.multipliers.renovated;
    
    return Math.ceil(base * factor * premium);
}

// --- CORE FUNCTION 2: NIGHTLY RATE ---
function calculateNightlyRate(verifiedRent, checkInDate) {
    const date = checkInDate ? new Date(checkInDate) : new Date();
    const month = date.getMonth();
    const isHighSeason = PRICING_CONFIG.seasonality.high_months.includes(month);
    
    const multiplier = isHighSeason 
        ? PRICING_CONFIG.seasonality.high_factor 
        : PRICING_CONFIG.seasonality.normal_factor;

    const dailyCost = verifiedRent / 30; // Real cost
    const recommended = Math.ceil(dailyCost * multiplier);
    
    return {
        recommended,
        min_limit: Math.floor(recommended * 0.8),
        max_limit: Math.ceil(recommended * 1.3),
        daily_base_cost: Math.ceil(dailyCost),
        seasonal_multiplier: multiplier,
        explanation: isHighSeason ? "תעריף שיא (עונה חמה)" : "תעריף רגיל",
        is_high_season: isHighSeason
    };
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, data } = body;

        if (action === 'estimate_rent') {
            const estimated_rent = estimateMonthlyRent({
                zoneId: data.zoneId,
                rooms: data.rooms,
                assetType: data.assetType,
                features: data.features
            });

            const zoneNameMap = {
                "tlv_heart": "לב העיר",
                "old_north": "הצפון הישן",
                "ramat_aviv": "רמת אביב",
                "south_jaffa": "פלורנטין / דרום ת״א"
            };

            return Response.json({
                estimated_rent,
                zone_name: zoneNameMap[data.zoneId] || "אזור תל אביב",
                breakdown: {
                    base_per_room: PRICING_CONFIG.zones[data.zoneId]?.base_rent || 0,
                    rooms: data.rooms,
                    features: data.features
                }
            });
        }

        if (action === 'calculate_price') {
            const pricing = calculateNightlyRate(data.verifiedRent, data.checkInDate);
            return Response.json(pricing);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in calculateFairPrice:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});