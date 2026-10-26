---
name: mobile-prototype-stage-v2
description: Build or adapt mobile-first service prototypes where desktop shows the app inside a demo stage with scenario controls.
metadata:
  short-description: Mobile prototype demo-stage builder v2
---

# Mobile Prototype Stage

Use this skill when the user wants a clickable service prototype, product concept, or demo stand where the phone-sized experience is the primary product surface and the desktop version frames it in a polished presentation scene.

The core pattern:

- On mobile, render only the product interface. It should feel like the user opened the real app or web flow on a phone.
- In desktop editing mode, keep the product interface at a realistic mobile size inside a scene, but do not wrap the overall desktop scene in an outer card/frame and do not add phone frame, device chrome, notch, speaker bar, or bezel. Add scenario controls beside it when they help demonstrate variants, states, profiles, or business logic.
- Always include system status and navigation bars inside the mobile interface. They are part of the prototype surface, not optional decoration. Platform can be set to `ios` or `android`, with `light` or `dark` appearance.
- Store demo variability in scenario data rather than scattering it through component code.

Desktop also includes a configurable **Presentation layer** and clean preview, defined below. Its device frame is an explicit exception to the frameless editing rules.

## Bundled Working Starter and Defaults

Use `assets/starter/index.html` as the working reference for this skill, including the complete scene editor, presentation sidebar, preview, device switching, image gallery, cursor controls, and mobile behavior. Read it before implementing the shell in another project. Replace only the example product content and scenario labels; adapt the reusable shell to the project stack while retaining the agreed behavior.

`assets/starter/defaults.json` records the initial settings and gallery entries. The HTML is directly runnable and keeps its own initial values aligned with that manifest; when changing defaults, update both. These are initial defaults, not saved browser-session state. Do not infer localStorage persistence.

To preview without installing packages, serve the skill directory with `python3 -m http.server 8765 --directory /absolute/path/to/mobile-prototype-stage-v2`, then open `/assets/starter/`. For reuse, copy the entire `assets/` directory or deliberately update every asset URL. All artwork, the supplied hand background, and the presentation font are bundled locally. No files in Downloads or another project are required.

Initial settings: iOS/light, 393 × 852px; scene radius iOS 60px / Android 50px; graphite iPhone or the platform-matched Android mockup; phone scale 90%, centered, canvas follows window; visible native cursor. Presentation starts with a 135° gradient using two colors from the actual product mockup. The bundled example uses #faf9f6 (screen background) → #dfeb8d (card background); these are example-specific, not universal defaults. Image mode defaults to the supplied hand image, cover, 100% scale, zero offsets, with image settings collapsed. Gallery is data-driven and currently contains exactly that one supplied image.

The included product screen is demonstration content, not a mandatory product design. Provider names remain only in source metadata, never presentation UI. Removed controls (rotation, tilt, Mesh) and the reverted 3D side edge must not be restored.

## Product Shape

Prefer this structure for new or refactored prototypes:

- `src/scenarios/` for scenario data, profiles, copy variants, amounts, feature flags, and named states.
- `src/prototype/` or `src/shell/` for reusable shell components such as `MobileSurface`, `DesktopStage`, and `ScenarioPanel`.
- `src/pages/` for the actual product flow.
- `public/assets/` for visible product assets, brand marks, images, icons, sounds, or exported design pieces.

Do not turn the first screen into a marketing landing page unless the user explicitly asks for a landing page. The first screen should be the usable prototype.

## Reusable Stage Components

Preserve the stage shell as reusable components instead of rebuilding it ad hoc for each prototype. At minimum, keep these pieces consistent across projects:

- `MobileSurface`: owns the scene pixel size, configurable scene radius (iOS 60px, Android 50px by default), shadow, overflow, background, and mobile/desktop responsive behavior.
- `SystemStatusBar`: always rendered at the top of the mobile surface, with iOS/Android and light/dark variants.
- `SystemNavigationBar`: always rendered at the bottom of the mobile surface, with iOS/Android and light/dark variants. Android button navigation and gesture navigation are mutually exclusive states of the same component.
- `ScenarioControls`: the desktop-only settings area outside the mobile surface. It contains only controls, without a panel background, title, hint text, or helper copy. Use the fixed control layout defined below.
- `StateButton`: the shared button style for scenario/state switches. All state buttons should reuse the same sizing, border, radius, typography, black/white/gray palette, and active state treatment.
- `CursorPresentationMode`: the required desktop-only scene pointer overlay and button-activation feedback. It owns the normal/dot cursor modes, the fixed `6px` white dot, and the three-ring click effect.

When adapting an existing project, first look for these components or their equivalents and update them in place. If the project does not have them, create small reusable components/classes/tokens before adding new variants. Do not let status bars, nav bars, settings controls, state button styles, or cursor presentation behavior drift between screens or scenarios.

## Responsive Behavior

Use a clear breakpoint, usually around tablet width:

- Below the breakpoint, the page should be full-viewport and app-like. Hide demo controls, decorative desktop framing, and explanatory text.
- Above the breakpoint, center the mobile surface inside a composed environment. Always expose scene size as an explicit pixel setting, even when using defaults. Use `width: 393px` and `height: 852px` as the default demo scene size; allow the user or scenario config to override both values in pixels. Use `min-height: 852px` only when the prototype needs natural content flow. Keep the mobile UI at that stable realistic size instead of stretching it. Apply the configurable border radius (iOS 60px, Android 50px by default) and soft shadow to this mobile-sized scene surface itself; a good default is `box-shadow: 0 28px 68px rgba(25, 33, 29, 0.1)`. In editing mode, keep it visually frameless: no phone mockup border, no hardware frame, no fake device top bar, and no notch.
- Put scenario controls outside the mobile surface. They are for demo operators, not end users.

The desktop composition should use `#F2F2F7` as the default neutral stage background unless the product brand clearly calls for a different environment. It may use subtle background atmosphere, product props, or a brand-appropriate environment, but the mobile interface must remain the visual subject. Do not add a large outer scene card, outer frame, or outer rounded panel behind the mobile surface and controls. Radius and shadow belong to the mobile-sized scene surface, not to a surrounding desktop container.

## Scenario Controls

Add controls only for variables that matter to the story. Common controls:

- persona/profile
- amount, plan, quantity, or selected option
- success, loading, error, empty, and edge states
- payment method, delivery method, rating, status, role, or permission level
- copy tone, locale, or theme variant

Keep controls compact and operational. The control panel should contain the switching controls themselves, not a title/header area, eyebrow row, helper icon, explanatory hint, or instructional copy. Do not place a shared card, panel background, tinted group surface, or extra container behind the controls; let the controls sit directly on the desktop scene. Avoid explanatory cards that describe how to use the prototype.

Scenario controls are demo-operator controls, not product UI. Never render them as a mobile menu, settings list, onboarding step, or full-height list inside the `MobileSurface`. On phone-sized viewports, hide `ScenarioControls` completely. On desktop, place them outside the mobile surface, beside the scene, using the fixed compact layout below.

Use this fixed `ScenarioControls` layout unless the user explicitly asks to change the settings UI. Treat the panel as a locked shell: a prototype may change only the scenario/state button labels and which scenario/state is active. Do not change, remove, rename, restyle, or reorder the fixed iOS/Android platform controls, the light/dark theme control, the cursor presentation control, or the scene-size controls. Do not change the button metrics, radius, shadows, typography, palette, or active-state design between prototypes.

- Panel root: `display: grid`, `gap: 6px`, `width: 176px`, no background, no border, no shadow, no padding wrapper.
- Main `StateButton`: `width: 100%`, `min-height: 35px`, `padding: 0 23px`, `border: 0`, `border-radius: 11px`, `background: #fff`, `color: var(--text)`, `box-shadow: 0 6px 11px rgba(31, 31, 38, 0.1)`, Inter Medium, `font-size: 12px`, `font-weight: 500`, `display: flex`, `align-items: center`, `justify-content: center`.
- Active `StateButton`: `background: var(--black)`, `color: #fff`; do not add a checkmark or secondary icon to selected scenario/state buttons unless the user explicitly asks.
- Platform/theme row: `display: grid`, `grid-template-columns: 67px 67px 35px`, `gap: 4px`, `margin-top: 18px`. Include iOS, Android, and light/dark theme controls only. Do not show an Android nav-mode toggle in the settings panel.
- Compact row buttons: `min-height: 35px`, `padding: 0 11px`, `border-radius: 11px`, `font-size: 12px`, centered content.
- Icon buttons: `35px` square visual footprint, same 11px radius and shadow as other controls. The light/dark theme toggle has two visual states: light mode is a white button using `assets/controls/theme-mode-light.svg`; dark mode is a black button using `assets/controls/theme-mode-dark.svg`. Switching theme must update both the system-bar artwork and this button state.
- Scene size row: always present, `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 4px`, `margin-top: 18px`.
- Scene size labels: show only `px`, position it inside the input at the right side, Inter Medium, `font-size: 12px`, `font-weight: 500`, muted gray with reduced opacity.
- Scene size inputs: `width: 100%`, `min-height: 35px`, `border: 0`, `border-radius: 11px`, white background, `box-shadow: 0 6px 11px rgba(31, 31, 38, 0.1)`, left-aligned text, Inter Medium, `font-size: 12px`, `font-weight: 500`, with right padding for the `px` suffix.
- Cursor presentation control: present only in desktop presentation settings, in its own row under a `Курсор` section before the preview button, aligned right. Do not render it in ordinary scene editing or clean preview. Use a full-width button with minimum 35px height, 11px radius, a 19px icon, and the persistent visible label `Скрывать курсор`. Default mode uses `assets/controls/cursor-mode-visible.svg`; enabled mode uses `assets/controls/cursor-mode-dot.svg`. Ensure high contrast in the dark presentation sidebar: inactive dark-gray button with white text/icon and a visible gray border; active light button with dark text/icon. Expose the toggle state through `aria-pressed`. Do not resize or restyle the existing platform/theme row or scene-size controls to fit this control.

Use switches, segmented controls, sliders, steppers, selects, and icon buttons only when the user explicitly asks for additional settings; otherwise keep the locked shell unchanged. Any added controls must map into this same sizing system. Style scenario controls only in black, white, and gray. Use black or dark gray for selected states, light gray/white for unselected states, and avoid colored highlights such as green in the control panel. Use one shared `StateButton` style for every scenario/state switch so button height, padding, border, radius, typography, and active state remain identical across states.

### Cursor Presentation Mode

Cursor presentation is a required shell capability, not optional demo polish. Every generated prototype must implement a reusable `CursorPresentationMode` component or framework-equivalent and the fixed cursor control below. Preserve this behavior exactly across prototypes:

- Visible mode is the default and keeps the browser cursor unchanged inside the mobile surface.
- Presentation mode hides the browser cursor only inside the mobile surface and replaces it with a small white dot. Use a fixed `6px` circle with a subtle dark edge or shadow so it stays visible on light product screens. Outside the mobile surface, keep the normal browser cursor.
- In presentation mode, a button activation inside the mobile surface creates three expanding white rings at the activation point. Create this feedback only for button activation inside the mobile surface; do not show it for arbitrary scene clicks, settings-panel clicks, visible-cursor mode, or mobile viewports.
- The dot and rings are presentation overlays: `pointer-events: none`, clipped by the mobile surface, above product content, and removed after the animation. Keep the ring animation around `600ms` and provide a reduced-motion treatment.
- On phone-sized viewports, do not render the custom pointer or click rings. Native touch behavior remains unchanged.

## Presentation Layer

Provide three desktop states: `editing`, `presentation-settings`, and `presentation-preview`. Keep this state separate from cursor mode, platform, theme, and product scenario. Default to editing.

- Append a `Презентация` StateButton after the scene settings; preserve all existing control order and metrics. It opens presentation settings and enables the presentation composition. Provide `Назад к сцене` to return to the frameless editor.
- Use reusable `PresentationLayer`, `DeviceMockup`, and `PresentationControls` components (or equivalents). Store background and mockup choices in a separate presentation config.
- Wrap the existing live MobileSurface with the mockup; never replace it with a screenshot, duplicate it, or remount the product when switching modes. Preserve product state, scroll, platform, theme, scene dimensions, and cursor preference.
- The mockup screen opening exactly matches configured scene width and height (default 393 × 852 CSS px). Use the bundled hardware frame outside that opening; keep its fixed corner geometry independent of the configurable scene radius. Support graphite (default) or silver device finish. Keep the overlay pointer-transparent and outside the screen opening. Do not add a second dynamic island, status bar, or navigation indicator.
- Fit the whole phone uniformly into available desktop space, allowing scale down but not changing the configured logical dimensions or stretching axes independently. Recalculate on viewport or scene-size changes, reserving room for settings and the preview exit button. Keep pointer coordinates correct after scaling.
- Background settings offer solid color, two-color linear gradient with angle, and an uploaded image with `cover`/`contain` and a fallback color. Use a file picker for local images, handle invalid files without losing the previous background, and revoke replaced object URLs. Expose image controls only for image mode and gradient controls only for gradient mode. Default to a two-color gradient drawn from the actual product mockup palette, including dark tones when present; follow the palette selection rule below. Keep controls compact using existing 35px height / 11px radius tokens; color swatches may display their actual selected color.
- Place the background behind the phone within the composition canvas. The device frame surrounds only the phone. Settings remain outside the product surface. A selected aspect ratio defines the canvas; it is not a rounded outer card.
- Use this presentation editor layout: dark dotted workspace, a fixed approximately 292px right sidebar (#202020), compact #2b2b2b fields, muted section separators, and a prominent light preview button. This sidebar is an explicit presentation-only exception to the frameless, heading-free 176px ScenarioControls contract; ordinary editing controls remain unchanged. Let the sidebar scroll independently on shorter desktops.
- Include device frame on/off, silver/graphite finish, scale, horizontal/vertical position, canvas aspect ratio (window, 16:9, 4:3, 1:1, 9:16), and the solid, gradient, or image background settings. Do not include Mesh, phone rotation, tilt, or their reset controls. Fit the phone bounds inside the chosen canvas and bound offsets to remaining space; do not crop the live interface. Preserve all composition settings through preview.
- The bundled phone frame is bundled as `assets/presentation/dresser-iphone.webp`; its source is documented in `assets/presentation/SOURCES.md`. Render it behind the live surface so its baked-in island is covered by the surface's own system artwork. Relative to the screen, frame geometry is left −6.064%, top −2.672%, width 112.127%, height 105.344%. At arbitrary scene sizes this is an adaptive mockup, not a claim of exact physical device dimensions. Keep one status bar/island and one navigation indicator. A darkened silver asset may be used for graphite; do not claim it is a separate original finish. Do not display asset-provider names or attribution links in the presentation UI; retain provenance only in the asset source documentation.
- A `Превью` button enters `presentation-preview`: hide all scenario buttons, platform/theme controls, scene-size and cursor controls, presentation settings, and editor decoration from both visual display and keyboard focus. Center the phone in the available stage; the product remains interactive.
- Keep one clearly visible, keyboard-accessible `Выйти из превью` button outside the phone, and support Escape. Both return to presentation settings, restoring the same configuration and product state. Move focus to the exit button on entry and restore focus to the preview trigger on exit. Preview does not require the browser Fullscreen API.
- On phone-sized viewports show only the product UI: no mockup, presentation background, presentation settings, custom cursor, or preview exit control. Restore the desktop state when the viewport grows again.

When asked to show this skill in action, build and open a small interactive preview demonstrating scene sizing, background settings, live product interaction, and entering/exiting preview. Clearly identify demo product content as an example.

## System Status And Navigation Bars

Every generated prototype should include system status and navigation bars inside the mobile surface:

- Default: render both the system status bar and the system navigation bar.
- Platform options: `ios` or `android`.
- Appearance options: `light` or `dark`.
- Use only the bundled SVG system-bar artwork from this skill. Do not redraw, approximate, generate, search for, or restyle the status/nav icons from memory or from another source.
- Bundled system-bar assets live in `assets/system-bars/` relative to this `SKILL.md`: `ios-status-light.svg`, `ios-status-dark.svg`, `android-status-light.svg`, `android-status-dark.svg`, `ios-nav-home-indicator-light.svg`, `ios-nav-home-indicator-dark.svg`, `android-nav-light.svg`, and `android-nav-dark.svg`.
- Strip only the SVG background surfaces (for example full-size `rect` fills) so status and navigation bars sit transparently over the mobile surface. Do not leave black, white, or gray rectangles behind the icons unless the product screen itself intentionally provides that background.
- Place system bars inside the mobile interface, aligned to the screen edge they belong to, not around the outside as a phone frame.
- Keep them minimal and recognizable. They should support realism without competing with the product UI.

Use this fixed system-bar design contract:

- `SystemStatusBar` container: `height: 60px`, `display: flex`, `align-items: center`, `justify-content: center`, transparent background.
- iOS status art: `width: 393px`, `height: 54px`; use `assets/system-bars/ios-status-light.svg` and `assets/system-bars/ios-status-dark.svg`, centered at the top.
- iOS dynamic island geometry must be identical in light and dark status assets and must not resize when changing theme, platform controls, or scene pixel size.
- Android status art: `width: 360px`, `height: 24px`; use `assets/system-bars/android-status-light.svg` and `assets/system-bars/android-status-dark.svg`, centered within the 60px status area.
- `SystemNavigationBar` container: absolute at bottom, `left: 0`, `right: 0`, `bottom: 0`, `height: 56px`, transparent background, centered content.
- iOS navigation art: `width: 375px`, `height: 32px`; use `assets/system-bars/ios-nav-home-indicator-light.svg` in light appearance and `assets/system-bars/ios-nav-home-indicator-dark.svg` in dark appearance.
- Android button navigation art: `width: 360px`, `height: 48px`; use `assets/system-bars/android-nav-light.svg` and `assets/system-bars/android-nav-dark.svg` only when the user explicitly asks for Android button navigation.
- Android gesture navigation is the default Android nav state. It uses the same home-indicator strip dimensions as iOS navigation. It is a mode of `SystemNavigationBar`, not an additional second navbar. Do not expose an Android nav-mode toggle in `ScenarioControls` unless the user explicitly asks for that control.
- Do not use a combined light/dark nav sprite, wide SVG with multiple home indicators, shifted `viewBox`, or unclipped `<image>` workaround for the home indicator. Each rendered nav state must point to exactly one single-indicator SVG, so the bottom bar can never show two strips at once.
- Light/dark appearance swaps only icon artwork or color; it must not change the mobile surface size, bar container size, bar position, or surrounding layout.

Status bar guidance:

- Render it at the top edge of the mobile interface.
- Use platform-appropriate time, signal, Wi-Fi, and battery indicators.
- For iOS, use the familiar centered/dynamic-safe-area feel only when it matches the requested platform realism, but do not add a notch or device frame unless the user explicitly asks for device chrome.
- For Android, use a Material/Android-style top system status treatment with compact right-aligned system indicators.
- Keep iOS and Android status SVGs separate. iOS status bars are typically wider/taller (for example `375x44`), while Android status bars are more compact (for example `360x24`). Do not swap their light/dark assets or reuse one platform's status bar for the other.
- In `light` appearance, use dark indicators on a light or transparent surface; in `dark` appearance, use light indicators on a dark or transparent surface.
- Account for status bar height in the product layout so content does not collide with it.

For iOS, follow the feel of Apple Human Interface Guidelines tab/navigation bars: simple monochrome symbols, enough hit area, clear selected state when there are multiple destinations, and light or dark material-like background treatment.

For Android, follow Material/Android navigation patterns: use a Material-style navigation bar or bottom app bar treatment, with simple icon destinations, clear active state, and light or dark surface colors. If supporting both classic Android navigation buttons and a gesture bar, expose them as mutually exclusive modes: the prototype should show either the Android back/home/overview buttons or the gesture handle, never both at the same time. The gesture handle may use the same simple iOS-like home indicator artwork when the user asks for Android navigation to be replaced by a strip.

If the navigation bar is only decorative, keep it inert. If it represents actual app destinations, make it clickable and bind it to scenario state.

## Interaction Quality

Build the important flow end to end. Make the product interface clickable, not just visually similar.

Use animation when it clarifies state or gives the demo life, but respect `prefers-reduced-motion`. Keep keyboard, safe-area, and viewport behavior believable on mobile.

For complex 3D, physics, payments, maps, calendars, or other established domains, prefer proven libraries already present in the project or commonly used in the stack.

## Starting From A Reference Project

When adapting an existing project such as the Tips prototype:

- Preserve the mobile/desktop split if it is already working.
- Extract hard-coded demo options into scenario data before adding many new variants.
- Keep brand-specific assets and business nouns only when the new prototype is actually for that brand or domain.
- Treat the existing app as a reference for interaction density, polish, and responsive behavior, not as a literal template to copy into unrelated products.

For packaging and reuse, use the bundled starter described above; preserve its relative asset paths.

## Verification

After implementation, run the project locally when possible and check both a phone-sized viewport and a desktop viewport. Confirm that:

- mobile shows only the product interface;
- mobile does not show scenario controls, platform switches, theme switches, nav-mode switches, or scene-size controls;
- desktop editing shows the mobile interface frameless in the scene with controls outside it;
- desktop mobile surface has a pixel size setting always present in editing mode, defaults to `393px` wide and `852px` high, and can be overridden in pixels without changing the surrounding layout;
- desktop has no large outer frame/card with its own radius or shadow;
- the mobile-sized scene surface uses configurable border radius (iOS 60px, Android 50px by default) and soft shadow;
- iOS/Android status and navigation bars are always present, support light/dark appearance, and sit inside the mobile interface;
- controls actually change the scenario;
- the control panel has no heading, eyebrow, helper text, or instructional hint;
- scenario controls have no shared background container; buttons use only black/white/gray styling with the fixed 11px border radius;
- scenario controls follow the fixed `ScenarioControls` layout and `StateButton` metrics from the skill, including 176px panel width, 35px pill buttons, 11px radius, soft shadow, black active state, and the scene size row in editing mode;
- only scenario/state labels and active scenario/state values changed; iOS/Android controls, theme control, scene-size controls, and all button visual metrics remain unchanged from the skill contract;
- the cursor control is a full-width labeled toggle with minimum 35px height, visible text `Скрывать курсор`, contrasting icon and `aria-pressed`, and appears only in presentation settings before the preview button; it is absent from ordinary scene editing and clean preview;
- cursor presentation mode shows one `6px` white dot only inside the desktop mobile surface and creates three expanding white rings only for button activation inside that surface;
- visible-cursor mode and phone-sized viewports do not show the custom dot or click rings;
- status and navigation bars follow the fixed system-bar design contract from the skill, including the saved SVG artwork, transparent backgrounds, exact art dimensions, 60px status area, and 56px bottom navigation area;
- the visible bottom navigation contains exactly one active nav artwork: either one iOS/home-indicator strip, one Android gesture strip, or one Android button-navigation artwork; never two strips or a light/dark pair at the same time;
- iOS dynamic island keeps the same geometry across light/dark status assets and does not resize during interactions;
- Android defaults to gesture navigation and the settings panel does not show a nav-mode toggle unless explicitly requested;
- status and navigation bars load SVGs from `assets/system-bars/` in this skill, not from newly drawn inline shapes, icon libraries, generated SVGs, external downloads, or guessed replacements;
- status bar, navigation bar, settings controls, and state buttons are implemented through reusable components/classes/tokens and keep the same layout and style across all scenarios;
- text does not overflow compact controls or the mobile surface.

Presentation checks:

- presentation mockup opening matches scene pixels; bezel is outside content and no system artwork is duplicated;
- changing width/height and resizing the desktop preserves aspect ratio and usable controls;
- solid, gradient (colors and angle), and uploaded-image backgrounds work; invalid image input preserves the previous background;
- preview hides every settings control from display and keyboard focus, while the app remains interactive;
- exit button and Escape both restore presentation settings without resetting product state, scroll, or settings;
- on mobile only the product is visible, including after resizing from desktop preview;
- cursor dot and button rings remain aligned with the live scaled surface.


### Gradient Colors From the Product Mockup

When building or adapting a prototype, choose both initial presentation gradient stops from colors actually used inside its product interface. Inspect product design tokens, CSS/computed styles, or the supplied design reference. Choose a pair in the same lightness group: either two dark colors or two light colors from the actual mockup. Never pair a light color with a dark color. Prefer two compatible product surfaces or an accent and supporting color within that same lightness group. A pair of dark colors is valid when both occur in the design; do not automatically lighten them, turn every palette into pastels, or exclude near-black tones. For a dark or monochrome mockup, two distinct dark shades are valid.

Do not sample the operator sidebar, device bezel, system-bar icons, or presentation background. Keep the sampled colors faithful rather than inventing unrelated shades. If a suitable pair is not evident, inspect secondary product surfaces and text colors; do not force a mixed light/dark pair or artificially lighten a dark color to match. Record the two product sources beside the default values. Keep both color pickers editable and preserve user overrides when switching modes, theme, or scenarios; do not continuously resample and overwrite their choices. For each new product, update the starter's initial color inputs and defaults manifest together instead of carrying over the demonstration palette. Verify both initial stops occur in the product palette, are both light or both dark, and that manual changes survive preview entry/exit.

### Background Image Transform

In presentation image-background settings, include independent image scale (25–300%, default 100%), horizontal and vertical offsets (−100% to +100% of canvas width/height, default 0), degree-free percent readouts, and a reset-position button. First compute the image's cover/contain fit from its natural dimensions and the composition canvas, then multiply by the image scale and offset from the centered position. Keep aspect ratio unchanged and show the configured fallback color in uncovered areas. These controls affect only the background, never the phone or live prototype. Show them only for image backgrounds, preserve values across preview entry/exit, and recalculate placement when canvas size or aspect ratio changes. Reset restores scale 100% and zero offsets without removing the uploaded image or changing its fit mode. Verify independent scaling and both offset axes, reset, and preview persistence.

### Shared Scene Corner Radius

Provide a numeric `Скругление сцены` setting in pixels in both desktop scene editing and presentation settings. Both controls edit the current platform’s shared radius state, default 60px for iOS and 50px for Android, range 0–120px. Keep separate per-platform radius values so switching devices restores each platform’s setting. Apply it to the live mobile surface and clipping; preserve it across modes and preview exit, and hide controls during clean preview. Corner radius affects only the live scene surface and its content clipping. Keep the bundled iPhone mockup unchanged for every radius value: do not replace it with a CSS bezel, change its geometry, stretch its corners, or change its assets in response to scene radius. This radius affects the mobile-sized prototype surface, not the background canvas. Native phone viewports remain edge-to-edge with radius zero. Verify edits in each mode synchronize the other, including values 0 and 120, and keep product state intact.

The cursor preference is shared and persists when entering/exiting preview or returning to scene editing. Moving its control does not change pointer-dot and button-ring behavior. Only the presentation settings expose the cursor toggle.

When cursor hiding is enabled, apply `cursor: none !important` to the desktop MobileSurface and all its descendants, including buttons, links, inputs and nested icons. Descendant `cursor: pointer` or text cursors must not leak through. Scope this override to desktop and the live surface; settings and exit controls retain native cursors. Verify computed cursor styles on interactive descendants in presentation preview and restore them when the toggle is disabled.

In image-background mode, hide the background color picker entirely; keep its fallback color internally. Keep the upload button directly visible. Put cover/contain, image scale, horizontal/vertical offsets, and reset inside a keyboard-accessible disclosure labeled `Настроить изображение`, collapsed by default. Opening or closing it must preserve all image settings. Solid and gradient modes retain their color controls.

### Android Presentation Mockup

Offer `Android · Pixel 10 Pro` alongside iPhone and no-frame in presentation device selection. Use bundled `assets/presentation/android-pixel.png`; source and screen insets are in SOURCES.md. Its 760×1600 artwork has a screen inset of top 29, right 37, bottom 30, left 30 pixels. Relative to the live screen, place the frame at left −4.329%, top −1.882%, width 109.668%, height 103.829%. Keep the existing live surface mounted and preserve scenario, scene dimensions, radius, background and cursor settings. Selecting Android switches system-bar artwork to Android; selecting iPhone switches it to iOS. Hide the iPhone finish selector for the Android asset, retaining its original dark finish. Radius remains scene-only and never changes frame geometry. Keep provenance out of visible UI. Verify switching both directions, working product buttons, preview persistence, and no device frame on mobile viewports.

Android scene radius defaults to 50px; iOS remains 60px. Apply the platform-specific default when switching either the scene platform or presentation device, preserving later user adjustments independently per platform. Mockup geometry remains unchanged.

### Presentation Background Gallery

Bundle the user-provided `assets/presentation/backgrounds/hand-dark.png` as the first selected preset for image-background mode. Keep the initial presentation background type unchanged; selecting Image displays this preset immediately without upload. Render a compact three-column thumbnail gallery above the upload control, with a visible selected border and accessible labels/pressed states. Define presets in a data array (id, label, src), ready for 5–6 additional user-provided images; do not add empty placeholders or unsolicited stock images. Selecting a preset replaces only the background and preserves transforms. Custom uploads remain supported and deselect gallery thumbnails. Guard async image loading against stale requests and revoke replaced object URLs. Store bundled assets locally so they load without network access.

When entering presentation settings from scene editing, automatically select the mockup matching the current scene platform: Android → Android Pixel, iOS → iPhone. Use current platform state, not the initial default or stale device selection. Preserve the platform-specific radius and other presentation settings. Returning from clean preview must retain the selected mockup, including no-frame; only entry from scene editing performs platform-to-mockup synchronization.
