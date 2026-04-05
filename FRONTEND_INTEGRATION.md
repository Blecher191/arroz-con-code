# Frontend-Backend Integration Guide

## Overview

The frontend is now fully integrated with the backend API. All components, hooks, and services are set up to communicate with the backend endpoints.

---

## What's Been Set Up

### 1. **API Client** (`src/services/api.ts`)
- Centralized API client with all backend endpoints
- Automatic JWT token handling from localStorage
- Error handling and response typing
- All 18+ backend endpoints wrapped

**Available APIs:**
- `authAPI` - Authentication (register, login, profile)
- `postsAPI` - Posts CRUD with filtering
- `commentsAPI` - Comments management
- `likesAPI` - Like/unlike on posts and comments
- `factCheckAPI` - Gemini fact-checking
- `translationAPI` - LibreTranslate translations
- `locationsAPI` - OpenStreetMap location search

### 2. **Authentication Context** (`src/context/AuthContext.tsx`)
- Updated with backend API integration
- Real `register()` and `login()` functions calling backend
- JWT token storage and retrieval
- User data synced with backend
- Loading and error states

**New User Interface:**
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  role: "regular" | "professional";
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}
```

### 3. **Custom Hooks** (`src/hooks/useApi.ts`)
Ready-to-use hooks for all operations:

- `usePosts(params)` - Fetch posts with filters
- `usePost(postId)` - Fetch single post
- `useComments(postId)` - Fetch comments
- `useCreatePost()` - Create new post
- `useCreateComment()` - Create comment
- `useLike()` - Toggle likes on posts/comments
- `useFactCheck(postId)` - Get fact-check results
- `useTranslation(postId, language)` - Get translations
- `useTranslatePost()` - Trigger translation

**Example usage:**
```typescript
function FeedComponent() {
  const { posts, loading, error } = usePosts({ category: 'Education' });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return posts.map(post => <PostCard key={post.id} post={post} />);
}
```

### 4. **Environment Configuration** (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## How to Test the Integration

### Step 1: Start Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Step 3: Test Authentication Flow

**1. Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!",
    "latitude": 33.749,
    "longitude": -84.388,
    "locationName": "Atlanta, GA"
  }'
```

**2. In browser console**, test AuthContext:
```javascript
// Test login
const auth = useAuth();
await auth.login('test@example.com', 'Password123!');
console.log(auth.user); // Should show user data
console.log(localStorage.getItem('token')); // Should show JWT
```

### Step 4: Test API Hooks

**Fetch posts:**
```javascript
function TestComponent() {
  const { posts, loading, error } = usePosts();
  
  useEffect(() => {
    console.log('Posts:', posts);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [posts, loading, error]);
  
  return null;
}
```

**Create a post:**
```javascript
function CreatePostTest() {
  const { createPost, loading } = useCreatePost();
  
  const handleCreate = async () => {
    try {
      const result = await createPost({
        title: 'Test Post',
        body: 'This is a test post',
        category: 'Education',
        latitude: 33.749,
        longitude: -84.388,
      });
      console.log('Post created:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return <button onClick={handleCreate} disabled={loading}>Create Post</button>;
}
```

---

## Next Steps: Update Frontend Pages

### Pages That Need API Integration:

1. **SignInPage.tsx** - Use `auth.login()`
2. **SignUpPage.tsx** - Use `auth.register()`
3. **FeedPage.tsx** - Use `usePosts()` to fetch and display posts
4. **PostDetailPage.tsx** - Use `usePost()` + `useComments()` + `useFactCheck()` + `useTranslation()`
5. **CreatePostPage.tsx** - Use `useCreatePost()` to submit
6. **ProfilePage.tsx** - Use `auth.user` to display profile

### Example: Update FeedPage

```typescript
import { usePosts } from '../hooks/useApi';
import PostCard from '../components/PostCard';

export default function FeedPage() {
  const [category, setCategory] = useState<'All' | 'Education' | 'Healthcare' | 'Technology'>('All');
  const { posts, loading, error, refetch } = usePosts(
    category !== 'All' ? { category } : undefined
  );

  if (loading) return <div className="p-4">Loading posts...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex gap-2 p-4">
        {['All', 'Education', 'Healthcare', 'Technology'].map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={cat === category ? 'font-bold' : ''}
          >
            {cat}
          </button>
        ))}
      </div>
      
      <div>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

---

## Key Features Ready to Integrate

✅ **Authentication** - Full JWT flow with backend validation
✅ **Posts** - CRUD with geolocation and filtering
✅ **Comments** - Create, read, update, delete with threading
✅ **Likes** - Toggle on posts and comments
✅ **Fact-Checking** - Display Gemini results with confidence scores
✅ **Translation** - Show original + translated text
✅ **Locations** - Search nearby resources via OpenStreetMap

---

## API Error Handling

All API functions throw errors on failure. Pages should handle them:

```typescript
try {
  const result = await createPost(data);
  // success
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  // show error to user
}
```

---

## Testing Checklist

- [ ] Backend runs on port 5000 without errors
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Frontend dev server starts (`npm run dev`)
- [ ] API requests include JWT token in Authorization header
- [ ] Login/register flow works end-to-end
- [ ] Posts display in feed with all data
- [ ] Can create/edit/delete posts
- [ ] Comments appear and update in real-time
- [ ] Likes toggle works
- [ ] Fact-check badges display
- [ ] Translation toggle shows translated text
- [ ] Location search returns results

---

## Troubleshooting

**CORS errors?**
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`

**JWT not persisting?**
- Verify token is being saved to localStorage
- Check `getAuthToken()` function in `api.ts`

**Posts not loading?**
- Check backend console for errors
- Verify database is initialized (`npm run db:reset`)
- Try fetching via curl first

**Type errors?**
- Run `npm run build` to see TypeScript errors
- Make sure `tsconfig.app.json` includes `"types": ["vite/client"]`

---

## Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| API Client | ✅ READY | All endpoints wrapped |
| AuthContext | ✅ READY | Backend integrated |
| Custom Hooks | ✅ READY | All 9 hooks ready |
| Frontend Pages | 🚧 TODO | Need individual page updates |
| Components | 🚧 TODO | PostCard, CommentCard, etc. |
| E2E Testing | 🚧 TODO | Manual testing needed |

---

## Questions?

Refer to backend API documentation in `/backend/README.md` for endpoint details.
