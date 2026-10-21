# Portfolio add-ons: drone hero, heart journey map, note wall, socials finale

## 1. Hero: drone + controller (replaces the cat)
- Remove the cat from the hero name.
- **Drone**: a hand-built isometric drone drawn to match the reference: white body, dark dome, yellow motor pods, coral propellers, camera with a blue lens and landing skids. It is not a copy of the watermarked clip.
  - The propellers spin all the time with a motion blur. The body bobs and tilts toward the direction it is flying.
  - It flies freely around the hero along a smooth wandering path and steers clear of the headline text. A soft shadow under it shrinks and grows with its height.
  - Pointing at it makes it dodge away. Clicking it makes it do a flip and shows a "hey!" bubble.
  - If the visitor has reduced motion turned on, the drone hovers in place.
- **Controller** (bottom-left, about 160px wide): an isometric remote in the same colours as the drone, with two joysticks, coloured buttons and a screen.
  - The antenna sends out radio rings, like the reference.
  - The joysticks lean in the direction the drone is flying, so they look like they are steering it live.
  - The screen shows a mini readout: ALT, SPD and a tiny radar dot.
  - Clicking the controller makes the drone do a stunt loop.
- **Mobile**: the drone flies a smaller path, the controller shrinks to about 110px, and tapping either one plays the same stunt.

## 2. Journey: map with a heart-shaped route (replaces the current timeline)
The layout follows the James Chugh reference:
- **Intro screen**: the heading "Engineer by degree, builder by obsession." with a subtitle "N stops between 2022 and now. Scroll to walk the path." Below it sits an illustrated city map (cream roads, green parks, a blue lake and building blocks). The route is drawn as a **heart shape**, with coloured pins at each stop.
- **Pinned scroll**: the section stays fixed on screen for about 100% of the screen height per stop.
  - Scrolling zooms the map into the current stop.
  - The blue route draws itself along the heart path, and a paper-plane marker travels along it to the active pin. The pin then pops up and shows a label.
  - A card on the left slides in for each stop: logo badge, date and place, a "01 / 06" counter, a title, a short story with highlighted keywords, an optional number stat, and an optional gallery of 3–4 thumbnails.
  - A row of progress dots at the bottom shows the current stop and its date, and you can click a dot to jump to that stop.
  - A compass rotates as the map moves. The zoom +/- buttons are decorative.
- **End screen**: after the last stop the map zooms back out to the full heart with every pin lit. A "View journey map" button replays the route.
- **Stops**: these start with your resume milestones (school, VCET admission, MOKSHA, MEDDESK, TRINETRA, hackathons/now). You will send the real stories and photos later.
- **Mobile**: no pinning. The map sits at the top of the screen and the cards stack and scroll, each one zooming the map to its stop.

## 3. "Before you leave, leave a note." (new section, before socials)
- **Header**: a small "The wall" label, the big heading, the subtitle "Say hi, share feedback, or tell me what you're building. It goes up on the wall.", and two buttons: **View notes** and **Write a note**.
- **Wall**: two rows of pastel sticky notes (yellow, pink, mint, lilac, blue, peach), each slightly tilted, with tape on top.
  - The rows scroll sideways in opposite directions and pause when you point at them.
  - Each note shows its text (cut off after 4 lines), an avatar, a name, and a role · company line.
  - Pointing at a note straightens it, lifts it, and turns the cursor into a dark "Read" bubble.
  - The last spot is a dashed empty note saying "Your note could be here — write one".
- **Read view**: clicking a note blurs and dims the page and opens the full note as a large sticky note with a close button. Esc and clicking outside also close it.
- **View notes**: opens all notes in a scrollable grid in the same blurred overlay.
- **Write a note** form, titled "PIN A NOTE / Leave your mark.":
  - Avatar: a "Shuffle avatar" button that cycles through generated cartoon avatars, or "Upload a photo" (image only, up to 2 MB).
  - Fields: name (required), "Where do you work?" (optional), "Your role" (optional), email (required, kept private, with a "only I'll see this" hint), and the note (required, max 300 characters, with a live counter).
  - Inputs are checked before sending, and the **Pin it to the wall** button turns on only when the form is valid.
  - Footer: "Your email stays private. Your name, photo and note go up on the wall."
- **On submit**: the note animates flying onto the wall at the front of the first row, with confetti and a sound blip. It is saved for everyone. Simple spam protection limits each browser to one note per minute, and an invisible honeypot field catches bots.
- **Moderation**: notes go live right away. You can delete a note from the Cloud dashboard.
- **Starter notes**: the wall launches with about 8 notes so it isn't empty. These need to be clearly fake or come from you. My recommendation is a few friendly placeholders you replace later.

## 4. Socials finale (the very last section, replaces the current outro)
- **Full-width sky**: a painted-cloud background with 3 cloud layers that drift at different speeds as you scroll (parallax), plus a torn-paper edge where it meets the note wall above.
- **Headline**: large white bold text, for example "Let's build something that actually ships." The last words sit on a hand-drawn yellow highlighter swipe that animates in. Below it: "Open to internships, collaborations and AI projects. I reply fast."
- **Card**: a cream rounded card with a faint grid. Its top line reads "psst, these work on your keyboard too: G I L R" (keyboard shortcuts).
- **Five glossy 3D keycap-style buttons**:
  - Gmail: copies or opens your email
  - GitHub
  - LinkedIn
  - Instagram or X
  - a yellow ↓ Resume download
- **Button behaviour**:
  - Each button presses down on click with a bounce and a sound blip.
  - Pointing at a button tilts it in 3D toward the cursor, adds a glint that sweeps across, and lifts it with a shadow.
  - Small handwritten notes connected by curved lines ("Where I build in public", "Book a 1:1…", "My resume, one click away") draw themselves in when you point at the matching button.
  - Pressing a shortcut key presses the matching button.
  - The email row has a copy icon that shows "copied!".
- A small footer line follows, and the page ends on the clouds.

## Things I need from you (placeholders until then)
- Social links (GitHub, LinkedIn, Instagram/X), plus a resume PDF to make downloadable.
- Journey stop stories and photos.
- Final headline wording for the finale. I will draft it.

## Technical details
- **Lovable Cloud** is enabled for the notes. The `notes` table holds id, name, company, role, email, avatar_url, body, color, rotation and created_at.
  - Public reads go through a server function that never returns email.
  - Inserts go through a validated server function: length limits, a honeypot check, and rate limiting by IP hash in a small `note_rate` table.
  - Grants and RLS are set up so the public cannot read email directly.
  - Uploaded avatars go to a public `note-avatars` storage bucket, restricted to images up to 2 MB.
  - The starter notes are seeded in the migration.
- **New components**: `Drone.tsx` (SVG with requestAnimationFrame flight on a noise-based path, plus a shared position store so the controller's joysticks mirror the drone's speed), `JourneyMap.tsx` (an SVG map with a parametric heart path; `getPointAtLength` places the plane and pins; a sticky container with scroll progress drives the zoom through the viewBox), `NoteWall.tsx` (with `NoteModal`, `NoteForm` and DiceBear-style procedural SVG avatars generated locally), and `Socials.tsx`. Everything uses design tokens; pastel note colours and the sky gradient are added to `styles.css`.
- A generated painted-cloud image and an optional yellow highlighter SVG.
- All of this is 2D SVG/CSS (no three.js), which keeps it fast on phones. Every motion respects reduced motion.
- **Removed**: `Cat.tsx`, the old `Journey` timeline and the `Outro`. The page order becomes … Ask → Journey map → Notes → Socials.
- Tests for the note rules: text required, max 300 characters, email required and never returned in public reads.
