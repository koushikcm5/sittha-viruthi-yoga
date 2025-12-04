# Components Folder Structure

## 📁 Organization

```
components/
├── common/                  # Shared Components
│   ├── SecureVideoPlayer.js    # Video player with security
│   └── UnifiedModal.js         # Standardized modal component
│
├── user/                    # User-specific Components
│   └── (future user components)
│
└── admin/                   # Admin-specific Components
    └── (future admin components)
```

## 🎯 Purpose

### Common Components
- Reusable across user and admin screens
- Core UI components
- Shared functionality

### User Components
- User-specific widgets
- Dashboard cards
- Progress indicators

### Admin Components
- Admin-specific widgets
- Management tables
- Analytics charts

## 📝 Import Examples

```javascript
// Common
import SecureVideoPlayer from '../../components/common/SecureVideoPlayer';
import UnifiedModal from '../../components/common/UnifiedModal';

// User (future)
import ProgressCard from '../../components/user/ProgressCard';

// Admin (future)
import UserTable from '../../components/admin/UserTable';
```
