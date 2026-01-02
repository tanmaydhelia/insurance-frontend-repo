# Policy Cards Not Visible - Debugging Guide

## 🔍 Issue: Policies Load but Cards Not Visible

### ✅ Fixes Applied

1. **Added debugging console logs** to track:
   - User authentication status
   - Policy fetch requests
   - Policy data received
   - Loading state
   - Signal updates

2. **Added effect()** to monitor signal changes in real-time

### 🧪 How to Debug

#### Step 1: Open Browser Console
1. Navigate to `/member/dashboard`
2. Open Browser DevTools (F12)
3. Go to Console tab

#### Step 2: Check Console Logs
You should see logs like:
```
User from auth service: { username: "...", email: "...", id: 4, role: "ROLE_USER" }
Fetching policies for user ID: 4
Policies received: [ {id: 1, ...}, {id: 2, ...} ]
Policies signal updated: (3) [{...}, {...}, {...}]
Is loading: false
```

### 🎯 Common Issues & Solutions

#### Issue 1: Empty Policies Array
**Console shows:**
```
Policies received: []
Policies signal updated: []
```

**Causes:**
- User has no policies in database
- Backend endpoint returning empty array
- User ID mismatch

**Solution:**
- Create test policies in backend for this user
- Check backend endpoint: `GET /api/policies/member/{userId}`
- Verify user ID matches between frontend and backend

#### Issue 2: Loading State Stuck
**Console shows:**
```
Is loading: true
```
(Stays true, never changes)

**Causes:**
- `isLoading` logic issue
- Policies never load

**Current `isLoading` logic:**
```typescript
isLoading = computed(() => {
  const user = this.userSignal();
  const data = this.policies();
  return !!user && !data; 
});
```

**Fix:**
The logic `!!user && !data` might be incorrect. If `data` is an empty array `[]`, `!data` is `false` because empty arrays are truthy in JavaScript!

**Better logic:**
```typescript
isLoading = computed(() => {
  const user = this.userSignal();
  const data = this.policies();
  // Check if user exists but data is undefined/null (not yet loaded)
  return !!user && data === undefined;
});
```

Or use a manual loading flag:
```typescript
private loadingSignal = signal(true);

policies = toSignal<IPolicy[], IPolicy[]>(
  this.authService.user$.pipe(
    tap(() => this.loadingSignal.set(true)),
    switchMap(user => {
      if (!user?.id) return of([]);
      return this.policyService.getMemberPolicies(user.id);
    }),
    tap(() => this.loadingSignal.set(false))
  ), 
  { initialValue: [] }
);

isLoading = this.loadingSignal.asReadonly();
```

#### Issue 3: Cards Render but Not Visible (CSS Issue)
**Console shows policies loaded but UI is blank**

**Possible causes:**
- `z-index` issues
- `display: none` or `visibility: hidden` in CSS
- Cards have `height: 0` or `width: 0`
- Parent container has `overflow: hidden` and cards are outside
- White text on white background

**Quick test:**
Add this temporarily to `policy-card.css`:
```css
:host {
  border: 3px solid red !important;
  min-height: 200px !important;
  display: block !important;
  background: yellow !important;
}
```

If you see yellow cards with red borders, it's a CSS issue. Otherwise, cards aren't rendering at all.

#### Issue 4: Template @for Loop Not Working
**Check if the template syntax is correct:**
```html
@for (policy of policies(); track policy.id) {
  <app-policy-card [policy]="policy" />
}
```

**Common mistakes:**
- Missing `track` expression
- Not calling `policies()` as a function (should be `policies()` not `policies`)
- Wrong variable name

#### Issue 5: PolicyCard Component Signal Input Issue
The PolicyCard uses new signal-based inputs:
```typescript
policy = input.required<IPolicy>();
```

Make sure the parent is binding correctly:
```html
<app-policy-card [policy]="policy" />
```

### 🔧 Temporary Fix: Use Traditional @Input

If signal inputs are causing issues, convert PolicyCard back to traditional inputs:

**In `policy-card.ts`:**
```typescript
@Input() policy!: IPolicy;  // Instead of input.required<IPolicy>()
@Output() onClaim = new EventEmitter<number>();  // Instead of output<number>()
@Output() onDownload = new EventEmitter<number>();
```

**In `policy-card.html`:**
Replace all `policy()` with just `policy`:
```html
{{ policy.insurancePlan.name }}  <!-- Not policy().insurancePlan.name -->
```

### 📊 Expected Console Output

**When working correctly:**
```
User from auth service: {id: 4, username: "user@example.com", ...}
Fetching policies for user ID: 4
Policies received: (3) [
  {id: 1, policyNumber: "POL001", ...},
  {id: 2, policyNumber: "POL002", ...},
  {id: 3, policyNumber: "POL003", ...}
]
Policies signal updated: (3) [{...}, {...}, {...}]
Is loading: false
isLoading check - user: {...}, policies: (3) [{...}, {...}, {...}]
```

### 🎯 Quick Fixes to Try

1. **Check if it's a loading issue:**
   ```typescript
   // Temporarily hardcode isLoading to false
   isLoading = computed(() => false);
   ```

2. **Check if policies are populated:**
   ```typescript
   // Add to constructor
   effect(() => {
     const pols = this.policies();
     console.log('Number of policies:', pols?.length);
     console.log('Policy details:', JSON.stringify(pols, null, 2));
   });
   ```

3. **Test with mock data:**
   ```typescript
   // Temporarily in constructor
   constructor() {
     this.policies = signal([
       {
         id: 1,
         policyNumber: 'TEST001',
         status: PolicyStatus.ACTIVE,
         // ... fill in required fields
       }
     ] as any);
   }
   ```

### ✅ Verification Checklist

- [ ] Browser console shows user authenticated
- [ ] Console shows "Fetching policies for user ID: X"
- [ ] Console shows policies received with data
- [ ] `policies()` returns array with items
- [ ] `isLoading()` is `false` after data loads
- [ ] Check Elements tab - PolicyCard elements exist in DOM
- [ ] Check Computed styles - cards have visible dimensions
- [ ] No CSS hiding the cards
- [ ] @for loop syntax is correct

---

**Next Steps:**
1. Run the app and check browser console
2. Share the console output
3. Based on logs, we can pinpoint the exact issue

**Status**: 🔍 Debugging mode enabled with console logs
