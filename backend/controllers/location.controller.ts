import type { Request, Response } from 'express';
import { pool } from '../config/database.ts';
import axios from 'axios';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// GET /api/locations/search?query=free+english+classes&latitude=X&longitude=Y
// Public - searches nearby resources using OpenStreetMap Nominatim
const searchLocations = async (req: Request, res: Response) => {
    try {
        const { query, latitude, longitude } = req.query;

        if (!query) {
            res.status(400).json({ error: 'query is required' });
            return;
        }

        const lat = latitude ? parseFloat(latitude as string) : null;
        const lng = longitude ? parseFloat(longitude as string) : null;

        // Build Nominatim request
        const params: Record<string, string> = {
            q: query as string,
            format: 'json',
            limit: '10',
            addressdetails: '1',
        };

        // If coordinates provided, bias results toward user location
        if (lat && lng) {
            params.viewbox = `${lng - 0.5},${lat + 0.5},${lng + 0.5},${lat - 0.5}`;
            params.bounded = '0'; // Don't strictly limit to viewbox, just bias
        }

        const response = await axios.get(NOMINATIM_URL, {
            params,
            headers: {
                'User-Agent': 'ArrozzConCode/1.0 (hackathon project)',
            },
        });

        const results = response.data;

        // Save to location_searches table if user is logged in or coords provided
        if (lat && lng) {
            const userId = (req as any).user?.id || null;
            await pool.query(
                `INSERT INTO location_searches (user_id, query, latitude, longitude, results)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, query, lat, lng, JSON.stringify(results)]
            );
        }

        res.json(results);
    } catch (err) {
        console.error('Error searching locations:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/locations/history
// Protected - get user's past location searches
const getSearchHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        const result = await pool.query(
            `SELECT id, query, latitude, longitude, results, created_at
             FROM location_searches
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 20`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching search history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default {
    searchLocations,
    getSearchHistory,
};
