# Scene Authoring API Issues - Current State & Notes

## 🚨 **Current Status: Partially Working**

### **✅ Working Components**
- **New Scene Creation** - Fully functional
- **Scene List Loading** - Working properly
- **Slides API** - Fixed and working (POST /api/slides/scene/{id})
- **Basic Scene Management** - Core functionality operational

### **❌ Known Issues**

#### **1. Slide-Items API Authorization Errors**
**Problem:** SlideItemController still has `authorize()` calls causing 500 errors
**Affected Endpoints:**
- `POST /api/slide-items/slide/{slideId}` - 500 Internal Server Error
- `GET /api/slide-items/slide/{slideId}` - Likely affected
- All other slide-items endpoints

**Root Cause:** Missing `AuthorizesRequests` trait in SlideItemController
**Impact:** "Create Sample Scene" fails at slide-items creation step

#### **2. Temporary Authentication Bypass**
**Current State:** Multiple API endpoints have auth middleware temporarily removed
**Affected Routes:**
- `/api/scenes/*` - No auth middleware
- `/api/slides/*` - No auth middleware  
- `/api/slide-items/*` - No auth middleware
- `/api/scenes/scene-items/*` - No auth middleware

**Security Note:** This is temporary for development/testing only

## 🔧 **Quick Fixes Applied**

### **SlideController Fixes**
- Commented out all `authorize()` method calls
- Fixed relationship name mismatch (`sceneItems` → `items`)
- Added proper relationship loading with `Scene::with('items')`
- Fixed field mapping between SceneItem and SlideItem models

### **Frontend Fixes**
- Fixed slide ID access (`slideData.id` → `response.data.id`)
- Created centralized `apiClient` service with OAuth token handling

## 📋 **Remaining Work**

### **Immediate Fixes Needed**
1. **Comment out authorize() calls in SlideItemController**
   ```php
   // Lines 22, 44, 100, 116, 157, 175, 199, 230
   // $this->authorize('view', $slide->scene);
   ```

2. **Re-enable proper authentication system**
   - Design comprehensive role-based auth
   - Implement proper API security
   - Remove temporary auth bypasses

### **Long-term Architecture**
1. **Unified Portal with Admin Capabilities**
2. **Role-based Access Control (RBAC)**
3. **Tenant-specific permissions**
4. **User-earned advancement system**

## 🎯 **Current Development Focus**

**Next Priority:** Admin functionality migration to Portal project with comprehensive auth system supporting:
- System admin capabilities
- Tenant admin settings management
- User scene authoring permissions
- Role-based advancement system

## 📝 **Technical Debt**

1. **Authentication System** - Needs complete redesign
2. **Authorization Framework** - Missing proper trait implementation
3. **API Security** - Currently bypassed for development
4. **Error Handling** - Inconsistent across controllers
5. **Database Relationships** - Some field mapping inconsistencies

---

**Last Updated:** October 7, 2025
**Status:** Scene Authoring partially functional, auth system needs redesign
