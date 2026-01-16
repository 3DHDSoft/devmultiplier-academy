# Affiliate Program Applications

Track affiliate program applications for the Tools page.

## Status Legend

- ⏳ Pending - Application submitted, waiting for response
- ✅ Approved - Affiliate link received and active
- ❌ Rejected - Application denied
- 📝 Not Applied - Need to apply

---

## Video Creation

| Tool      | Status         | Application URL                                                      | Affiliate Link | Notes |
| --------- | -------------- | -------------------------------------------------------------------- | -------------- | ----- |
| HeyGen    | 📝 Not Applied | [heygen.com/affiliate-program](https://heygen.com/affiliate-program) | -              |       |
| Synthesia | 📝 Not Applied | [synthesia.io/partners](https://www.synthesia.io/partners)           | -              |       |

## Voice & Audio

| Tool       | Status      | Application URL                                              | Affiliate Link                           | Notes  |
| ---------- | ----------- | ------------------------------------------------------------ | ---------------------------------------- | ------ |
| ElevenLabs | ✅ Approved | [elevenlabs.io](https://elevenlabs.io)                       | `https://try.elevenlabs.io/fqta2rsfzcn8` | Active |
| Descript   | ⏳ Pending  | [descript.com/affiliate](https://www.descript.com/affiliate) | -                                        |        |

## Code Assistants

| Tool           | Status         | Application URL | Affiliate Link | Notes                        |
| -------------- | -------------- | --------------- | -------------- | ---------------------------- |
| Claude         | ❌ N/A         | -               | -              | No affiliate program         |
| Claude Code    | ❌ N/A         | -               | -              | No affiliate program         |
| Cursor         | 📝 Not Applied | Contact support | -              | Check if they have a program |
| GitHub Copilot | ❌ N/A         | -               | -              | No affiliate program         |

## Design & UI

| Tool         | Status         | Application URL                                       | Affiliate Link | Notes                |
| ------------ | -------------- | ----------------------------------------------------- | -------------- | -------------------- |
| v0 by Vercel | 📝 Not Applied | Part of Vercel program                                | -              | Apply through Vercel |
| Figma        | 📝 Not Applied | [figma.com/partners](https://www.figma.com/partners/) | -              |                      |

## Infrastructure

| Tool     | Status         | Application URL                                        | Affiliate Link | Notes                       |
| -------- | -------------- | ------------------------------------------------------ | -------------- | --------------------------- |
| Vercel   | ⏳ Pending     | [vercel.com/partners](https://vercel.com/partners)     | -              | Applied as Solution Partner |
| Neon     | ⏳ Pending     | [neon.tech/partners](https://neon.tech/partners)       | -              | Applied                     |
| Supabase | 📝 Not Applied | [supabase.com/partners](https://supabase.com/partners) | -              |                             |

## Productivity

| Tool    | Status         | Application URL                                          | Affiliate Link | Notes                        |
| ------- | -------------- | -------------------------------------------------------- | -------------- | ---------------------------- |
| Notion  | 📝 Not Applied | [notion.so/affiliates](https://www.notion.so/affiliates) | -              |                              |
| Raycast | 📝 Not Applied | Contact support                                          | -              | Check if they have a program |

---

## Application Template

Use this when applying to affiliate programs:

```
Company: DevMultiplier Academy (3D HD Soft, LLC)
Website: https://devmultiplier.com
Contact: info@devmultiplier.com
Job Title: CEO / Founder

About:
I run DevMultiplier Academy, a course platform teaching AI-assisted development to senior developers and CTOs. Our courses cover [relevant topics for this tool].

I currently use [Tool Name] and want to recommend it to my students through an affiliate/referral program. My audience includes decision-makers who choose tools and infrastructure for their teams.

Relevant courses where I'd feature [Tool Name]:
- [Course 1]
- [Course 2]

This positions me as someone who can drive qualified traffic to [Tool Name] through my courses.
```

---

## Next Steps

1. ~~Apply for ElevenLabs~~ ✅
2. ~~Apply for Vercel~~ ⏳
3. ~~Apply for Neon~~ ⏳
4. Apply for Supabase
5. Apply for HeyGen
6. Apply for Synthesia
7. Apply for Descript
8. Apply for Figma
9. Check Cursor for affiliate program
10. Apply for Notion
11. Check Raycast for affiliate program

---

## Updating Tools

When you receive an affiliate link, update `src/lib/tools.ts`:

```typescript
// Find the tool entry and replace the affiliateUrl
affiliateUrl: 'https://your-affiliate-link-here',
```

Then remove the `// Replace with your affiliate link` comment.
