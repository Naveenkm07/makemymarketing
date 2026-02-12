# Playback Tracking System (Proof of Play)

## Overview

The playback tracking system provides proof-of-play verification for advertisements displayed on screens. Screen owners log playback events, which advertisers can view to verify their ads were displayed as agreed.

## Database Schema

### Playback Logs Table

```sql
CREATE TABLE playback_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  duration_played INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields

- **booking_id**: Links to the booking this playback is for
- **screen_id**: The screen that played the ad
- **played_at**: Timestamp when the ad was displayed
- **duration_played**: How long the ad played (in seconds)
- **metadata**: Additional data (resolution, viewer count, etc.)

## Playback Workflow

### 1. Screen Plays Advertisement

When a screen displays an ad, it logs the playback event:

```typescript
POST /api/playback
{
  "booking_id": "uuid",
  "screen_id": "uuid",
  "duration_played": 30,
  "metadata": {
    "resolution": "1920x1080",
    "estimated_viewers": 150,
    "weather": "sunny"
  }
}
```

### 2. Advertiser Verifies Playback

Advertisers can view playback logs for their bookings:

```typescript
GET /api/playback?booking_id=uuid
```

### 3. Analytics and Reporting

Aggregate playback data for:
- Total impressions
- Average play duration
- Peak viewing times
- Geographic distribution

## API Endpoints

### GET /api/playback

Fetch playback logs for the authenticated user.

**Query Parameters:**
- `booking_id` (optional): Filter by specific booking
- `screen_id` (optional): Filter by specific screen
- `limit` (optional): Number of records to return (default: 100)

**Response:**
```json
{
  "ok": true,
  "logs": [
    {
      "id": "uuid",
      "booking_id": "uuid",
      "screen_id": "uuid",
      "played_at": "2026-02-12T14:30:00Z",
      "duration_played": 30,
      "metadata": {
        "resolution": "1920x1080",
        "estimated_viewers": 150
      },
      "created_at": "2026-02-12T14:30:05Z",
      "bookings": {
        "id": "uuid",
        "campaign_id": "uuid",
        "start_time": "2026-02-12T00:00:00Z",
        "end_time": "2026-02-19T00:00:00Z"
      },
      "screens": {
        "id": "uuid",
        "name": "Downtown Billboard #5",
        "location": "Main Street, NYC"
      }
    }
  ]
}
```

### POST /api/playback

Log a playback event (screen owners only).

**Request Body:**
```json
{
  "booking_id": "uuid",
  "screen_id": "uuid",
  "duration_played": 30,
  "metadata": {
    "resolution": "1920x1080",
    "estimated_viewers": 150,
    "weather": "sunny",
    "time_of_day": "afternoon"
  }
}
```

**Authorization:**
- User must own the screen

**Response:**
```json
{
  "ok": true,
  "log": { /* playback log object */ },
  "message": "Playback logged successfully"
}
```

## Row Level Security (RLS)

### View Playback Logs
Users can view logs for:
- Their own screens (owners)
- Bookings from their campaigns (advertisers)

### Create Playback Logs
Only screen owners can create playback logs for their screens.

## Integration Examples

### Screen Device Integration

```typescript
// Screen device code (runs on the display hardware)
class AdPlayer {
  async playAd(booking: Booking) {
    const startTime = Date.now();
    
    // Display the ad
    await this.displayContent(booking.ad_content);
    
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    
    // Log the playback
    await this.logPlayback({
      booking_id: booking.id,
      screen_id: this.screenId,
      duration_played: durationSeconds,
      metadata: {
        resolution: this.getResolution(),
        estimated_viewers: await this.estimateViewers(),
        weather: await this.getWeather(),
        brightness: this.getBrightness()
      }
    });
  }
  
  async logPlayback(data: PlaybackData) {
    const response = await fetch('https://api.makemymarketing.com/api/playback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      // Retry logic or queue for later
      await this.queueForRetry(data);
    }
  }
}
```

### Advertiser Dashboard

```typescript
// Fetch playback stats for a campaign
async function getCampaignPlaybackStats(campaignId: string) {
  // Get all bookings for campaign
  const bookings = await getBookingsForCampaign(campaignId);
  
  // Fetch playback logs for each booking
  const allLogs = await Promise.all(
    bookings.map(booking => 
      fetch(`/api/playback?booking_id=${booking.id}`)
        .then(r => r.json())
    )
  );
  
  // Calculate stats
  const totalPlays = allLogs.flat().length;
  const totalDuration = allLogs.flat().reduce(
    (sum, log) => sum + (log.duration_played || 0), 
    0
  );
  
  return {
    total_impressions: totalPlays,
    total_duration_seconds: totalDuration,
    average_duration: totalDuration / totalPlays,
    logs_by_screen: groupByScreen(allLogs)
  };
}
```

## Metadata Best Practices

### Recommended Metadata Fields

```typescript
interface PlaybackMetadata {
  // Display information
  resolution: string;           // "1920x1080"
  brightness: number;           // 0-100
  
  // Viewer analytics
  estimated_viewers?: number;   // Estimated audience size
  viewer_demographics?: {
    age_range: string;
    gender_split: object;
  };
  
  // Environmental context
  weather?: string;             // "sunny", "rainy", etc.
  temperature?: number;         // Celsius
  time_of_day?: string;         // "morning", "afternoon", etc.
  
  // Technical details
  device_id?: string;
  software_version?: string;
  network_quality?: string;     // "excellent", "good", "poor"
  
  // Performance
  load_time_ms?: number;
  errors?: string[];
}
```

## Analytics Queries

### Total Impressions by Campaign

```sql
SELECT 
  c.id,
  c.name,
  COUNT(pl.id) as total_impressions,
  SUM(pl.duration_played) as total_seconds,
  AVG(pl.duration_played) as avg_duration
FROM campaigns c
JOIN bookings b ON b.campaign_id = c.id
JOIN playback_logs pl ON pl.booking_id = b.id
WHERE c.user_id = 'user-uuid'
GROUP BY c.id, c.name
ORDER BY total_impressions DESC;
```

### Playback by Hour of Day

```sql
SELECT 
  EXTRACT(HOUR FROM played_at) as hour,
  COUNT(*) as plays,
  AVG(duration_played) as avg_duration
FROM playback_logs
WHERE booking_id = 'booking-uuid'
GROUP BY hour
ORDER BY hour;
```

## Verification and Compliance

### Proof of Play Certificate

Generate a verification report for advertisers:

```typescript
async function generateProofOfPlay(bookingId: string) {
  const logs = await getPlaybackLogs(bookingId);
  const booking = await getBooking(bookingId);
  
  return {
    booking_id: bookingId,
    campaign_name: booking.campaign.name,
    screen_name: booking.screen.name,
    contracted_period: {
      start: booking.start_time,
      end: booking.end_time
    },
    actual_plays: logs.length,
    total_duration: logs.reduce((sum, l) => sum + l.duration_played, 0),
    first_play: logs[0]?.played_at,
    last_play: logs[logs.length - 1]?.played_at,
    verification_timestamp: new Date().toISOString(),
    certificate_hash: generateHash(logs) // For tamper detection
  };
}
```

## Future Enhancements

- [ ] Add photo/video proof of playback
- [ ] Implement real-time playback notifications
- [ ] Add viewer analytics integration (cameras, sensors)
- [ ] Create automated compliance reports
- [ ] Add blockchain verification for immutable proof
- [ ] Implement anomaly detection for fraud prevention
- [ ] Add geographic heatmaps for playback distribution
