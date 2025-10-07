# Standing System Implementation

## ✅ **Implementation Complete**

The enhanced Standing System has been fully implemented with Reputation, Engagement, and Affinity (R/E/A) metrics as specified in the Standing System design document.

## 🎯 **Core Implementation**

### **Three-Metric System**

#### **1. Reputation (0-1000)**
- **Source**: Community-driven
- **Purpose**: Tracks user credibility, trust, and quality of contributions
- **Control**: Adjusted by community interactions and feedback
- **Visibility**: Private to user and admins

#### **2. Engagement (0-1000)**
- **Source**: System-maintained
- **Purpose**: Tracks activity, participation, and consistency
- **Control**: Automatically updated by the system
- **Visibility**: Private to user and admins

#### **3. Affinity (0-1000)**
- **Source**: Admin-adjusted
- **Purpose**: Tracks community integration and connection
- **Control**: Set and adjusted by administrators
- **Visibility**: Private to user and admins

### **Standing Calculation**

```php
Standing = (Reputation + Engagement + Affinity) / 3
```

**Result**: Composite value (0-1000) representing overall user position in community

### **Trust Level (0-1000)**
- **Separate Field**: Admin-only tracking
- **Purpose**: Allows admins to track user trustworthiness independently of standing
- **Not Included**: Does not affect standing calculation
- **Visibility**: Admin-only

## 📊 **Standing Levels**

### **Global Default Levels**

| Standing Range | Level Name    | Description |
|---------------|---------------|-------------|
| 900-1000      | Guardian      | Highest level |
| 750-899       | Curator       | Advanced level |
| 600-749       | Steward       | Established level |
| 400-599       | Collaborator  | Active level |
| 200-399       | Contributor   | Growing level |
| 0-199         | Member        | Entry level |

### **Tenant-Custom Levels**

Tenants can override the global standing level names with custom names:

```php
$tenant->setStandingLevels([
    ['min' => 900, 'name' => 'Elite Member'],
    ['min' => 750, 'name' => 'Senior Member'],
    ['min' => 600, 'name' => 'Active Member'],
    ['min' => 400, 'name' => 'Regular Member'],
    ['min' => 200, 'name' => 'New Member'],
]);
```

## 🗄️ **Database Schema**

### **Users Table**

```sql
ALTER TABLE users
ADD COLUMN reputation SMALLINT DEFAULT 0,      -- 0-1000 (community-driven)
ADD COLUMN engagement SMALLINT DEFAULT 0,      -- 0-1000 (system-maintained)
ADD COLUMN affinity SMALLINT DEFAULT 0,        -- 0-1000 (admin-adjusted)
ADD COLUMN standing SMALLINT DEFAULT 0,        -- 0-1000 (calculated)
ADD COLUMN trust_level SMALLINT DEFAULT 0;     -- 0-1000 (admin-only)
```

### **Tenants Table**

```sql
ALTER TABLE tenants
ADD COLUMN standing_levels JSON NULL;  -- Custom standing level names
```

## 💻 **User Model API**

### **Calculation Methods**

```php
// Calculate standing from R/E/A metrics
$user->calculateStanding();  // Returns int (0-1000)

// Get standing level name
$user->getStandingLevelName();           // Global default
$user->getStandingLevelName($tenant);    // Tenant-specific

// Get full metrics (user/admin only)
$user->getStandingMetrics();  // Returns array with R/E/A/standing/level_name
```

### **Update Methods**

```php
// Update Reputation (community-driven)
$user->updateReputation(50, 'Helpful comment');

// Update Engagement (system-maintained)
$user->updateEngagement(10, 'Completed scene');

// Update Affinity (admin-only)
$user->updateAffinity(25, $admin, 'Active community participant');

// Set Trust Level (admin-only)
$user->setTrustLevel(750, $admin, 'Verified trusted user');
```

## 🔒 **Visibility & Privacy**

### **Public Visibility**
- **Standing Level Name**: Only visible if user opts in (cosmetics)
- **Numeric Values**: Never shown publicly
- **Metrics**: Never shown publicly

### **Private Visibility (User Only)**
- Standing level name
- R/E/A individual metrics
- Calculated standing value
- Progress to next level (future)

### **Admin Visibility**
- All user metrics
- Trust level
- Standing calculation breakdown
- Historical changes (future)

## 🚀 **OAuth Integration**

User data now includes standing information:

```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "reputation": 450,
  "engagement": 380,
  "affinity": 420,
  "standing": 416,
  "standing_level": "Collaborator",
  "is_admin": false
}
```

## 📝 **Migration Notes**

### **Existing Data**
- Old `reputation` values (0-100 float) automatically scaled to 0-1000
- Formula: `new_reputation = old_reputation * 10`
- New users start with all metrics at 0

### **Backward Compatibility**
- Trust level separate from standing (admin discretion)
- Can be rolled back with down migrations
- Old reputation values preserved in scaled form

## 🎯 **Future Enhancements**

### **Phase 1: Logging & History** (Future)
- Log all R/E/A changes with reasons
- Track standing progression over time
- Audit trail for admin adjustments
- Historical analytics

### **Phase 2: Automation** (Future)
- Auto-calculate engagement from user activity
- Community reputation triggers
- Standing level achievement notifications
- Progress indicators

### **Phase 3: Cosmetics** (Future)
- Opt-in standing level display
- Profile badges and accents
- Visual indicators (non-competitive)
- Achievement celebrations

### **Phase 4: Topic Affinity** (Future)
- Expand affinity to topic-specific tracking
- Topic expertise levels
- Specialized standing per interest area

## ✨ **Key Benefits**

1. **Holistic Measurement**: R/E/A captures different aspects of user value
2. **Flexible Control**: Community, system, and admin can each influence standing
3. **Privacy-First**: Metrics private by default, opt-in public display
4. **Tenant Customization**: Custom level names for brand alignment
5. **Admin Tools**: Trust level for independent admin tracking
6. **Extensible**: Foundation for future gamification and recognition

---

**Status**: ✅ Fully Implemented
**Next Steps**: Deep system implementation with logging, automation, and UI enhancements
