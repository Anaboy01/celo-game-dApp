/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			'card-foreground': 'hsl(var(--card-foreground))',
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			'popover-foreground': 'hsl(var(--popover-foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			'primary-foreground': 'hsl(var(--primary-foreground))',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			'secondary-foreground': 'hsl(var(--secondary-foreground))',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			'muted-foreground': 'hsl(var(--muted-foreground))',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'accent-foreground': 'hsl(var(--accent-foreground))',
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			'destructive-foreground': 'hsl(var(--destructive-foreground))',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: 'hsl(var(--sidebar))',
  			'sidebar-foreground': 'hsl(var(--sidebar-foreground))',
  			'sidebar-primary': 'hsl(var(--sidebar-primary))',
  			'sidebar-primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  			'sidebar-accent': 'hsl(var(--sidebar-accent))',
  			'sidebar-accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  			'sidebar-border': 'hsl(var(--sidebar-border))',
  			'sidebar-ring': 'hsl(var(--sidebar-ring))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)'
  			],
  			mono: [
  				'var(--font-mono)'
  			]
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};

module.exports = config;
