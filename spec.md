# Specification

## Summary
**Goal:** Build a Google Photos-style media gallery app (PhotoVault) with photo/video upload, full-screen viewer, multi-select actions, and a 1000 TB storage quota system.

**Planned changes:**
- Redesign the UI to match Google Photos: full-width responsive grid gallery with date-grouped sections, top navigation bar with logo and search, and side/bottom navigation for Gallery, Albums, and Library views
- Support photo (jpg, png, gif, webp, heic) and video (mp4, mov, avi, mkv) uploads with a progress indicator; display uploaded media as thumbnails immediately after upload
- Add a full-screen lightbox/modal viewer with previous/next navigation, inline video playback, and file metadata (name, date, size)
- Implement multi-select mode with a contextual action bar offering Download, Share (copy link), Copy, and Delete (with confirmation) for selected items
- Show a storage usage indicator (used vs. 1000 TB total) in a settings/profile panel with a color-coded progress bar
- Update the backend to store file metadata (name, size, MIME type, upload timestamp, unique ID) per user and enforce a 1000 TB quota
- Apply a clean Google Photos-inspired visual theme: white/light-grey backgrounds, rounded cards, subtle shadows, sans-serif typography, teal/pink accents, and smooth hover/selection animations

**User-visible outcome:** Users can upload, browse, view, and manage photos and videos in a Google Photos-like interface with multi-select actions, full-screen viewing, and a visible 1000 TB storage quota tracker.
