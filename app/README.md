Studio Portfolio – React ⚡️ Vite + Tailwind

Welcome to Studio, a modern and opinionated portfolio and service‑showcase template built with React 19
, Vite 7
 and the latest Tailwind CSS v4
. The goal of this project is to provide a polished, senior‑level starting point for agencies, studios or freelancers to present their services, case studies and pricing in a premium, performant way.

✨ What’s inside?

src/App.jsx is the heart of the app. It defines a number of data arrays – navigation items, services, projects, pricing tiers, the tech stack and testimonials – and then renders them into a cohesive single‑page website. Thanks to framer-motion and lucide-react, the page is full of subtle animation and crisp icons. Here’s an overview of the key sections:

Hero & navigation

The top of the page features a sticky navigation bar and a hero section with a gradient heading and call‑to‑action buttons. Navigation items are defined in the nav array, each with an id that anchors to its corresponding section
raw.githubusercontent.com
. The hero highlights your studio’s craft (e.g. “CRM · Software · SMM · Marketing” and “Senior‑level craft”)
raw.githubusercontent.com
 and includes buttons to jump straight to your work or pricing
raw.githubusercontent.com
.

Services

Services are listed in an array of objects that include an icon, title, description and a set of tags
raw.githubusercontent.com
. Only three services show initially, with a “View all” toggle; each card reveals more details and badges for relevant technologies or domains
raw.githubusercontent.com
. To customise this section, edit the services array in src/App.jsx and supply your own icon component from lucide-react or any other library.

Projects

Case studies live in the projects array. Each entry contains a title, impact label, a short blurb, optional links (e.g. live site and GitHub repo) and an array of image paths
raw.githubusercontent.com
. The site renders these in a responsive grid with a lightweight image carousel or a favicon preview if no images are provided
raw.githubusercontent.com
. To feature your own work, drop images into src/assets/projects/... and update the array accordingly.

Process

This section outlines your product development process in four steps: Discovery, Design, Build and Grow
raw.githubusercontent.com
. Each card lists a few bullet points relevant to that stage (e.g. “Stakeholder interviews”, “User flows & prototypes”, “QA & automation” and “Performance marketing”
raw.githubusercontent.com
). Feel free to adapt the labels and bullet points to match your methodology.

Pricing

Pricing tiers are defined in the pricing array. Each tier specifies a name, price, informational blurb and a list of included features
raw.githubusercontent.com
. Cards are styled with luxe gradients; one card can be marked as featured to highlight your most popular package
raw.githubusercontent.com
. Edit or add tiers to suit your offerings—there’s even an AI Bot Service example illustrating an add‑on package
raw.githubusercontent.com
.

Tech stack

The stack array enumerates all languages, frameworks, databases and tooling you use
raw.githubusercontent.com
. Tags are rendered as pills in a flexible grid
raw.githubusercontent.com
. Update this list to reflect your own expertise; the current values include TypeScript, React/Next.js, Node, Python/Django, Go, Postgres, Kafka, Docker/K8s, LangChain and more.

About & testimonials

The About section summarises your ethos. The provided copy emphasises a senior‑only studio shipping fast and delivering measurable impact
raw.githubusercontent.com
. It also displays key stats (e.g. average conversion uplift, uptime, releases across industries) using StatPill components
raw.githubusercontent.com
. A side card lists certifications like SOC2 and HIPAA readiness
raw.githubusercontent.com
. The Testimonials section displays quotes from past clients, drawn from the testimonials array
raw.githubusercontent.com
.

Contact

A simple contact form collects the visitor’s name, email, company and project description
raw.githubusercontent.com
. Below the form are mail, phone and social links and a submit button
raw.githubusercontent.com
. Change the placeholders and href values to route submissions to your own mailbox or CRM.

Little extras

Animated raccoon pop‑up: When the visitor scrolls near the end of the page, a raccoon GIF pops up using a custom RaccoonPop component
raw.githubusercontent.com
.

Gradient glow backgrounds: Sections use the Glow component to overlay blurred gradient circles for subtle depth
raw.githubusercontent.com
.

Responsive design: Tailwind ensures that layouts collapse gracefully on small screens, while the grid system scales to wider viewports.

🔧 Installation

This project uses modern JavaScript syntax and requires Node 20+. Follow these steps to get up and running locally:

Install dependencies: run npm install.

Start the development server: run npm run dev to launch Vite at http://localhost:5173.

Create a production build: run npm run build – the output will be written to the dist/ folder.

Preview the production build: run npm run preview to serve the build locally.

The package.json file shows the current dependencies—React 19, Framer Motion, Lucide React and Tailwind 4, along with ESLint and Vite dev tooling
raw.githubusercontent.com
. Updating these packages will require a Node version that supports the ES modules used by Vite.

🗂 Project structure
├── public/               # static assets (favicon, vite logo)
├── src/
│   ├── assets/           # images and GIFs used in projects and logos
│   ├── App.jsx           # main component rendering all sections
│   ├── index.css         # imports Tailwind base styles:contentReference[oaicite:23]{index=23}
│   └── main.jsx          # entry point mounting <App />:contentReference[oaicite:24]{index=24}
├── index.html            # HTML scaffold used by Vite:contentReference[oaicite:25]{index=25}
├── package.json          # scripts and dependencies:contentReference[oaicite:26]{index=26}
├── tailwind.config.js    # Tailwind configuration:contentReference[oaicite:27]{index=27}
├── vite.config.js        # Vite config (base path for GH Pages):contentReference[oaicite:28]{index=28}
└── .github/workflows/    # GitHub Actions for automatic deployment:contentReference[oaicite:29]{index=29}


The workflow files under .github/workflows/ automatically build and deploy the site to GitHub Pages whenever you push to main
raw.githubusercontent.com
. If you plan to host elsewhere, you can remove or adjust the base property in vite.config.js
raw.githubusercontent.com
.

🎨 Customisation

Rename the project: Change the repository name and update vite.config.js’s base field when deploying to GitHub Pages
raw.githubusercontent.com
.

Update content: Edit the arrays at the top of src/App.jsx to modify navigation, services, projects, pricing tiers, tech stack and testimonials
raw.githubusercontent.com
raw.githubusercontent.com
. Replace or remove the raccoon GIF and logo by swapping files in src/assets/ and adjusting the imports at the top of the file
raw.githubusercontent.com
.

Change styling: Tailwind utility classes drive the entire design. Adjust colours, spacing and typography via the className strings in JSX or override Tailwind’s default theme in tailwind.config.js.

Add pages: This template is a single‑page application, but you can easily split sections into individual components or routes using React Router if your portfolio grows.

📦 Deployment

Out‑of‑the‑box, the repository is configured for GitHub Pages. The workflow defined in .github/workflows/pages.yml runs npm ci, builds the site and uploads the resulting dist/ folder to Pages
raw.githubusercontent.com
. The base path in vite.config.js ensures assets resolve correctly when hosted at https://<username>.github.io/portf/ 
raw.githubusercontent.com
. To deploy elsewhere (e.g. Netlify, Vercel), remove the base option and follow the respective provider’s instructions.

🤝 Contributing

Pull requests are welcome! If you find a bug or want to add a new feature (e.g. dark/light theme toggle or CMS integration), please open an issue first to discuss your proposal.

🪪 Licence

This project currently lacks an explicit licence file; it is intended as a starting point for your own portfolio. Before publishing a derivative, you should choose an appropriate open source licence (for example MIT or Apache‑2.0) and add a LICENSE file to clarify usage rights.

Built with 💻 and ☕ by studio. Let us know how you customise it!
