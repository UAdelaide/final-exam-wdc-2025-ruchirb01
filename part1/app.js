app.get('/api/dogs', async (req, res) => {
    try {
        const dogQuery = `
            SELECT 
                Dogs.name as dog_name,
                Dogs.size,
                Users.username as owner_username
            FROM Dogs 
            INNER JOIN Users ON Dogs.owner_id = Users.user_id
            WHERE Users.role = 'owner'
            ORDER BY Dogs.name ASC
        `;
        
        const [dogResults] = await db.execute(dogQuery);
                return res.status(200).json(dogResults);
        
    } catch (dbError) {
        console.error('err in /api/dogs:', dbError.message);
        
        res.status(500).json({ 
            error: 'qry fail', 
            message: 'this shit dont work' 
        });
    }
});


app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const sqlQuery = `
            SELECT 
                walkReq.request_id,
                dogInfo.name as dog_name,
                walkReq.requested_time,
                walkReq.duration_minutes,
                walkReq.location,
                ownerInfo.username as owner_username
            FROM WalkRequests walkReq
            INNER JOIN Dogs dogInfo ON walkReq.dog_id = dogInfo.dog_id
            INNER JOIN Users ownerInfo ON dogInfo.owner_id = ownerInfo.user_id
            WHERE walkReq.status = 'open'
            ORDER BY walkReq.requested_time ASC, dogInfo.name ASC
        `;
        
        const [queryResults] = await db.execute(sqlQuery);
        
        res.status(200).json(queryResults);
        
    } catch (dbError) {
        console.error('shit not wokring:', dbError);        
        res.status(500).json({ 
            error: 'udk', 
            message: 'boop beep',
            timestamp: new Date().toISOString()
        });
    }
});



app.get('/api/walkers/summary', async (req, res) => {
    try {
        const walkerStatsQuery = `
            SELECT 
                walkerUser.username as walker_username,
                COALESCE(COUNT(ratingData.rating), 0) as total_ratings,
                CASE 
                    WHEN COUNT(ratingData.rating) > 0 
                    THEN ROUND(AVG(ratingData.rating), 1)
                    ELSE NULL 
                END as average_rating,
                COALESCE(COUNT(DISTINCT completedWalks.request_id), 0) as completed_walks
            FROM Users walkerUser
            LEFT JOIN WalkApplications acceptedApps 
                ON walkerUser.user_id = acceptedApps.walker_id 
                AND acceptedApps.status = 'accepted'
            LEFT JOIN WalkRequests completedWalks 
                ON acceptedApps.request_id = completedWalks.request_id 
                AND completedWalks.status = 'completed'
            LEFT JOIN WalkRatings ratingData 
                ON completedWalks.request_id = ratingData.request_id 
                AND walkerUser.user_id = ratingData.walker_id
            WHERE walkerUser.role = 'walker'
            GROUP BY walkerUser.user_id, walkerUser.username
            ORDER BY average_rating DESC, total_ratings DESC, walker_username ASC
        `;
        
        const [walkerMetrics] = await db.execute(walkerStatsQuery);
        const processedResults = walkerMetrics.map(walker => ({
            walker_username: walker.walker_username,
            total_ratings: parseInt(walker.total_ratings),
            average_rating: walker.average_rating,
            completed_walks: parseInt(walker.completed_walks)
        }));
                res.json(processedResults);
        
    } catch (queryException) {
        console.error('no:', {
            error: queryException.message,
            stack: queryException.stack,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({ 
            error: 'wtf',
            message: 'icantbebothered',
            code: 'this_is_gay'
        });
    }
});
