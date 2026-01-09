---
description: 'Documentation and Content Creation Standards'
applyTo: '**/*.md'
---

## Markdown Content Rules

The following markdown content rules are enforced in the validators:

1. **Headings**: Use appropriate heading levels (H2, H3, etc.) to structure your content. Do not use an H1 heading, as
   this will be generated based on the title.
2. **Lists**: Use bullet points or numbered lists for lists. Ensure proper indentation and spacing.
3. **Code Blocks**: Use fenced code blocks for code snippets. Specify the language for syntax highlighting.
4. **Links**: Use proper markdown syntax for links. Ensure that links are valid and accessible.
5. **Images**: Use proper markdown syntax for images. Include alt text for accessibility.
6. **Tables**: Use markdown tables for tabular data. Ensure proper formatting and alignment.
7. **Line Length**: Limit line length to 400 characters for readability.
8. **Whitespace**: Use appropriate whitespace to separate sections and improve readability.
9. **Front Matter**: Include YAML front matter at the beginning of the file with required metadata fields.

## Formatting and Structure

Follow these guidelines for formatting and structuring your markdown content:

- **Headings**: Use `##` for H2 and `###` for H3. Ensure that headings are used in a hierarchical manner. Recommend
  restructuring if content includes H4, and more strongly recommend for H5.
- **Lists**: Use `-` for bullet points and `1.` for numbered lists. Indent nested lists with two spaces.
- **Code Blocks**: Use triple backticks
  (`) to create fenced code blocks. Specify the language after the opening backticks for syntax highlighting (e.g., `csharp).
- **Links**: Use `[link text](URL)` for links. Ensure that the link text is descriptive and the URL is valid.
- **Images**: Use `![alt text](image URL)` for images. Include a brief description of the image in the alt text.
- **Tables**: Use `|` to create tables. Ensure that columns are properly aligned and headers are included.
- **Line Length**: Break lines at 80 characters to improve readability. Use soft line breaks for long paragraphs.
- **Whitespace**: Use blank lines to separate sections and improve readability. Avoid excessive whitespace.

## Validation Requirements

Ensure compliance with the following validation requirements:

- **Front Matter**: Include the following fields in the YAML front matter:
  - `post_title`: The title of the post.
  - `author1`: The primary author of the post.
  - `post_slug`: The URL slug for the post.
  - `microsoft_alias`: The Microsoft alias of the author.
  - `featured_image`: The URL of the featured image.
  - `categories`: The categories for the post. These categories must be from the list in /categories.txt.
  - `tags`: The tags for the post.
  - `ai_note`: Indicate if AI was used in the creation of the post.
  - `summary`: A brief summary of the post. Recommend a summary based on the content when possible.
  - `post_date`: The publication date of the post.

- **Content Rules**: Ensure that the content follows the markdown content rules specified above.
- **Formatting**: Ensure that the content is properly formatted and structured according to the guidelines.
- **Validation**: Run the validation tools to check for compliance with the rules and guidelines.

## File Structure Emoji Conventions

Best practice emoji conventions for ASCII file structures in technical documentation.

### Common File Type Emojis

| Type         | Emoji | Example                 |
| ------------ | ----- | ----------------------- |
| TypeScript   | 🔷    | `🔷 index.ts`           |
| JavaScript   | 🟡    | `🟡 script.js`          |
| JSON/Config  | ⚙️    | `⚙️ tsconfig.json`      |
| Markdown     | 📝    | `📝 README.md`          |
| Folder       | 📁    | `📁 src/`               |
| SQL          | 🗄️    | `🗄️ schema.sql`         |
| Generic File | 📄    | `📄 file.txt`           |
| YAML         | 📋    | `📋 docker-compose.yml` |
| Shell Script | 🐚    | `🐚 build.sh`           |
| Docker       | 🐳    | `🐳 Dockerfile`         |
| CSS/Styles   | 🎨    | `🎨 styles.css`         |
| HTML         | 🌐    | `🌐 index.html`         |
| React/JSX    | ⚛️    | `⚛️ App.tsx`            |
| Test Files   | 🧪    | `🧪 app.test.ts`        |
| Environment  | 🔐    | `🔐 .env`               |
| Git          | 📦    | `📦 .gitignore`         |
| Image        | 🖼️    | `🖼️ logo.png`           |
| PDF          | 📕    | `📕 document.pdf`       |

### Example File Structure

```
📁 project/
├── 📝 README.md
├── ⚙️ package.json
├── ⚙️ tsconfig.json
├── 🐳 Dockerfile
├── 📋 docker-compose.yml
├── 🔐 .env.example
├── 📁 src/
│   ├── 🔷 index.ts
│   ├── 🔷 config.ts
│   ├── 📁 components/
│   │   ├── ⚛️ App.tsx
│   │   └── ⚛️ Header.tsx
│   └── 📁 utils/
│       └── 🔷 helpers.ts
├── 📁 tests/
│   └── 🧪 app.test.ts
└── 📁 docs/
    └── 📝 API.md
```

### Minimal Style (Without Emojis)

For better terminal/editor compatibility:

```
project/
├── README.md
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── components/
│   │   ├── App.tsx
│   │   └── Header.tsx
│   └── utils/
│       └── helpers.ts
├── tests/
│   └── app.test.ts
└── docs/
    └── API.md
```

### Tips

1. **Consistency**: Pick one convention and use it throughout your documentation
2. **Accessibility**: Not all terminals/editors render emojis well—consider your audience
3. **Simplicity**: When in doubt, use 📁 for folders and 📄 for files
4. **Context**: Use more specific emojis (🔷, ⚛️, 🧪) when file types matter to the explanation

### Unicode Box Drawing Characters

For ASCII trees without emojis:

| Character | Name            | Usage               |
| --------- | --------------- | ------------------- |
| `├──`     | Branch          | Middle items        |
| `└──`     | Last branch     | Final item in group |
| `│`       | Vertical line   | Continuation        |
| `───`     | Horizontal line | Connection          |

---

_DevMultiplier Academy - Documentation and Content Creation Standards_
