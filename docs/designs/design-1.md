```html
<!doctype html>

<html class="dark" lang="en">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
      rel="stylesheet"
    />
    <style>
      .material-symbols-outlined {
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }
      body {
        background-color: #131313;
        color: #e5e2e1;
        -webkit-font-smoothing: antialiased;
      }
      .glass-panel {
        background: rgba(57, 57, 57, 0.6);
        backdrop-filter: blur(20px);
      }
    </style>
    <script id="tailwind-config">
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              'on-secondary-fixed-variant': '#005226',
              'on-tertiary-container': '#570a0b',
              'on-error': '#690005',
              'primary-fixed': '#d9e2ff',
              tertiary: '#ffb4ac',
              'on-secondary': '#003918',
              'on-tertiary': '#611211',
              'surface-container-high': '#2a2a2a',
              'inverse-primary': '#0059c7',
              'on-primary': '#002d6d',
              'on-background': '#e5e2e1',
              'tertiary-fixed': '#ffdad6',
              'secondary-container': '#05e777',
              'on-tertiary-fixed-variant': '#7f2924',
              'on-surface': '#e5e2e1',
              'surface-container-highest': '#353534',
              primary: '#afc6ff',
              'inverse-surface': '#e5e2e1',
              'primary-fixed-dim': '#afc6ff',
              surface: '#131313',
              'on-surface-variant': '#c1c6d7',
              'surface-container-lowest': '#0e0e0e',
              'on-primary-container': '#00275f',
              'surface-bright': '#393939',
              'error-container': '#93000a',
              'surface-dim': '#131313',
              'on-tertiary-fixed': '#410003',
              'primary-container': '#528dff',
              'surface-container-low': '#1c1b1b',
              'inverse-on-surface': '#313030',
              error: '#ffb4ab',
              'on-secondary-fixed': '#00210b',
              'secondary-fixed-dim': '#00e475',
              'tertiary-fixed-dim': '#ffb4ac',
              'on-primary-fixed': '#001944',
              'secondary-fixed': '#62ff96',
              background: '#131313',
              'surface-variant': '#353534',
              'on-secondary-container': '#00622e',
              'surface-container': '#201f1f',
              'on-primary-fixed-variant': '#004299',
              'surface-tint': '#afc6ff',
              'outline-variant': '#414755',
              outline: '#8b90a0',
              'tertiary-container': '#de7067',
              'on-error-container': '#ffdad6',
              secondary: '#7dffa2',
            },
            fontFamily: {
              headline: ['Manrope'],
              body: ['Inter'],
              label: ['Inter'],
            },
            borderRadius: {
              DEFAULT: '0.25rem',
              lg: '0.5rem',
              xl: '0.75rem',
              full: '9999px',
            },
          },
        },
      };
    </script>
    <style>
      body {
        min-height: max(884px, 100dvh);
      }
    </style>
  </head>
  <body
    class="font-body selection:bg-primary selection:text-on-primary-container"
  >
    <!-- TopAppBar -->
    <header
      class="bg-[#131313] dark:bg-[#131313] docked full-width top-0 no-border bg-[#201f1f] flat no shadows flex justify-between items-center w-full px-6 py-4 fixed z-50"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full overflow-hidden">
          <img
            class="w-full h-full object-cover"
            data-alt="close-up studio portrait of a sophisticated man with glasses looking directly at camera with neutral expression"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkBrFAqJQ8NWgqfLrSCMohiXICLZNCE0uomvH6TuybGselXCZPNYodanw4yvr3TV5fQ8ZFThzI9PxfJlNvRJ_ANHOmBs2P2_nZ841z3jJ8q9EQf69LsWXEuRvlxSf5HfK5uza_qkxt-AW19oz39fXLqqeKxroiBz1GNS1OukTH-VCSq4hRXejoQEXfBDbTBSlM2vbjEc2DU8c70dl2SbezTPx3LCiYZ21jXW4sRHA6486zKt3djpiuHAUqRoPHU9I3Gt90qO-lRQaX"
          />
        </div>
        <span
          class="text-xl font-extrabold text-[#e5e2e1] tracking-tighter font-headline"
          >Saverah</span
        >
      </div>
      <div class="flex items-center gap-4">
        <button
          class="text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors p-2 rounded-full active:scale-95 duration-200"
        >
          <span class="material-symbols-outlined">dark_mode</span>
        </button>
      </div>
    </header>
    <main class="pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-10">
      <!-- Hero Section: Asymmetric Wealth Summary -->
      <section class="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div class="md:col-span-7">
          <p
            class="font-label text-primary uppercase tracking-[0.2em] mb-4 text-xs font-semibold"
          >
            Monthly Performance
          </p>
          <h1
            class="font-headline font-bold text-5xl md:text-7xl tracking-tighter text-on-surface leading-none mb-6"
          >
            $12,480.<span class="text-on-surface-variant/40">00</span>
          </h1>
          <div class="flex gap-4 items-center">
            <span
              class="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-label text-xs font-medium flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-sm">trending_up</span>
              +12.4% vs last month
            </span>
          </div>
        </div>
        <div class="md:col-span-5 grid grid-cols-2 gap-4">
          <div class="bg-surface-container p-6 rounded-xl space-y-2">
            <p class="font-label text-on-surface-variant text-xs font-medium">
              TOTAL INCOME
            </p>
            <p class="font-headline text-2xl font-bold text-secondary">
              $18,200
            </p>
          </div>
          <div class="bg-surface-container p-6 rounded-xl space-y-2">
            <p class="font-label text-on-surface-variant text-xs font-medium">
              TOTAL SPENT
            </p>
            <p class="font-headline text-2xl font-bold text-tertiary">$5,720</p>
          </div>
        </div>
      </section>
      <!-- Bento Grid: Budget Categories & Quick Actions -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Category Breakdown Column -->
        <div class="md:col-span-2 space-y-6">
          <h2 class="font-headline text-2xl font-bold tracking-tight px-2">
            Category Breakdown
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Housing (Normal) -->
            <div class="bg-surface-container p-6 rounded-xl space-y-6">
              <div class="flex justify-between items-start">
                <div class="bg-surface-container-high p-3 rounded-lg">
                  <span class="material-symbols-outlined text-primary"
                    >home</span
                  >
                </div>
                <p class="font-label text-on-surface-variant text-xs font-bold">
                  HOUSING
                </p>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm font-medium">
                  <span>$2,200</span>
                  <span class="text-on-surface-variant">Limit $2,500</span>
                </div>
                <div
                  class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-primary rounded-full"
                    style="width: 88%"
                  ></div>
                </div>
              </div>
            </div>
            <!-- Food (Warning State) -->
            <div class="bg-surface-container p-6 rounded-xl space-y-6">
              <div class="flex justify-between items-start">
                <div class="bg-error/10 p-3 rounded-lg">
                  <span class="material-symbols-outlined text-error"
                    >restaurant</span
                  >
                </div>
                <div class="flex flex-col items-end">
                  <p
                    class="font-label text-on-surface-variant text-xs font-bold"
                  >
                    FOOD &amp; DINING
                  </p>
                  <span
                    class="text-[10px] text-error font-bold uppercase tracking-widest mt-1 flex items-center gap-1"
                  >
                    <span
                      class="material-symbols-outlined text-[12px]"
                      data-weight="fill"
                      >warning</span
                    >
                    Over limit
                  </span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm font-medium">
                  <span class="text-error">$920</span>
                  <span class="text-on-surface-variant">Limit $800</span>
                </div>
                <div
                  class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-error rounded-full"
                    style="width: 100%"
                  ></div>
                </div>
              </div>
            </div>
            <!-- Entertainment (Near Limit) -->
            <div class="bg-surface-container p-6 rounded-xl space-y-6">
              <div class="flex justify-between items-start">
                <div class="bg-surface-container-high p-3 rounded-lg">
                  <span class="material-symbols-outlined text-secondary"
                    >movie</span
                  >
                </div>
                <p class="font-label text-on-surface-variant text-xs font-bold">
                  ENTERTAINMENT
                </p>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm font-medium">
                  <span>$480</span>
                  <span class="text-on-surface-variant">Limit $500</span>
                </div>
                <div
                  class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-secondary rounded-full"
                    style="width: 96%"
                  ></div>
                </div>
              </div>
            </div>
            <!-- Add New Category CTA -->
            <div
              class="bg-surface-container-low border-2 border-dashed border-outline-variant/30 p-6 rounded-xl flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-primary/50 transition-colors"
            >
              <span
                class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-3xl"
                >add_circle</span
              >
              <p
                class="font-label text-xs font-bold tracking-widest text-on-surface-variant uppercase"
              >
                New Category
              </p>
            </div>
          </div>
        </div>
        <!-- Transaction Logging Sidebar -->
        <div class="space-y-6">
          <h2 class="font-headline text-2xl font-bold tracking-tight px-2">
            Log Transaction
          </h2>
          <div class="bg-surface-container p-6 rounded-xl space-y-6">
            <div class="space-y-4">
              <div class="flex gap-2">
                <button
                  class="flex-1 py-3 px-4 bg-surface-container-high rounded-full text-sm font-bold text-on-surface-variant hover:bg-secondary/10 hover:text-secondary transition-all"
                >
                  Income
                </button>
                <button
                  class="flex-1 py-3 px-4 bg-primary text-on-primary-container rounded-full text-sm font-bold"
                >
                  Expense
                </button>
              </div>
              <div class="space-y-1">
                <label
                  class="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold ml-4"
                  >Amount</label
                >
                <input
                  class="w-full bg-surface-container-low border-none border-b-2 border-primary focus:ring-0 text-xl font-bold px-4 py-3 rounded-xl"
                  placeholder="0.00"
                  type="text"
                />
              </div>
              <div class="space-y-1">
                <label
                  class="font-label text-[10px] text-on-surface-variant uppercase tracking-widest font-bold ml-4"
                  >Category</label
                >
                <select
                  class="w-full bg-surface-container-low border-none focus:ring-0 text-sm font-medium px-4 py-3 rounded-xl appearance-none"
                >
                  <option>Select Category</option>
                  <option>Housing</option>
                  <option>Food</option>
                  <option>Entertainment</option>
                </select>
              </div>
              <button
                class="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-primary/10 active:scale-95 transition-all"
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      </section>
      <!-- Recent Transactions: Editorial Style -->
      <section class="space-y-6">
        <div class="flex justify-between items-end px-2">
          <h2 class="font-headline text-2xl font-bold tracking-tight">
            Recent Activity
          </h2>
          <button
            class="text-primary font-label text-xs font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
          >
            View Archive
          </button>
        </div>
        <div class="bg-surface-container rounded-2xl overflow-hidden">
          <!-- Transaction Item -->
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-5">
              <div
                class="w-12 h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center"
              >
                <img
                  class="w-full h-full object-cover"
                  data-alt="minimalist black coffee cup icon on a stark background for a modern cafe brand"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUuUXX-gPSmMnoSPuj4xDv2HiQU2dEiWfCnNjrEBUHh5SqF14r6Y9tjKWIAIm9MvcTaMmzWeFX9qchxU7295Hk8yvlteGR2AMFZPwW1VQjZYN1lOxIBrHOI8My_WFxtZOx5lohj1N6AyX5YdAdkKtXq5ymCOFqnSMNgsJMia68K8PbQYiBPPhoDuILeiw9CJb32OAMxpQ6gU9J6KsodxRAX76WbvpFRrbmeh2pVLYd1kZQ1MBYusq8AvP3KolnUglv1buhukkmpYX3"
                />
              </div>
              <div>
                <p class="font-bold text-on-surface">Artisan Roast Coffee</p>
                <p class="font-label text-xs text-on-surface-variant">
                  Food &amp; Dining • Today, 10:42 AM
                </p>
              </div>
            </div>
            <p class="font-headline font-bold text-lg">-$12.50</p>
          </div>
          <!-- Transaction Item -->
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-5">
              <div
                class="w-12 h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center"
              >
                <img
                  class="w-full h-full object-cover"
                  data-alt="vibrant abstract shape in purple and neon pink representing digital subscription services"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRuJJgR8jlEM4pbdHd_dJYgLVRaUyuKlYPKj2tSsCFwA2QF7QeKXm6hGjApy0teW_V7IDafaIuzbST4wY10MYmOS_Nk10YaTO36F2hw3AJ2jR3bbIa9_T59hZD0ejvCx3-8-kRrFixPZ71mu2zGeJAqgu-e8k42mSs3B7M3AB5ZaEadh0D6AfRyo8RNJd1oZcTHinoib73Sch0Y6s5xj3v0jnT-B1naiN1Y-nlAukRYJEw8oHShHWIOL_CXAmNnq5q6HgxGdfkAS4j"
                />
              </div>
              <div>
                <p class="font-bold text-on-surface">Monthly Netflix Premium</p>
                <p class="font-label text-xs text-on-surface-variant">
                  Entertainment • Yesterday
                </p>
              </div>
            </div>
            <p class="font-headline font-bold text-lg">-$19.99</p>
          </div>
          <!-- Transaction Item -->
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-5">
              <div
                class="w-12 h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center"
              >
                <img
                  class="w-full h-full object-cover"
                  data-alt="clean architectural facade representing professional services and corporate payments"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgX1OnT3-qvR7ISgC5tfoLzfJ7B5Y8K5C7IWhReOEPj2aVkMYM352akk-GzRPyjei7maOjaLzmVR46iNOP0ayazECWhawJOnIij1GSR1xSDAV2Jwz9-hN-1TX1gQFxV1zXbb-ne39FG4L4wYeHx4wvO7-WL68usrZq7j1wf8IslhUYHSTK7Hf-xJN-PGsQ330zdz_TGBWJ5oVqHuX4kQXSzZw66W2xoLnj-ML37nwXp9gReGvzh3ib-_W-2qMOznUIo1SjLUJxuTs3"
                />
              </div>
              <div>
                <p class="font-bold text-on-surface">
                  Freelance Project Payment
                </p>
                <p class="font-label text-xs text-on-surface-variant">
                  Income • Oct 24, 2023
                </p>
              </div>
            </div>
            <p class="font-headline font-bold text-lg text-secondary">
              +$4,200.00
            </p>
          </div>
        </div>
      </section>
    </main>
    <!-- BottomNavBar -->
    <nav
      class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#393939]/70 backdrop-blur-xl rounded-t-[24px] shadow-[0_-4px_40px_rgba(0,0,0,0.06)] md:hidden"
    >
      <a
        class="flex flex-col items-center justify-center text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-all"
        href="#"
      >
        <span class="material-symbols-outlined mb-1">home_app_logo</span>
        <span
          class="font-['Inter'] text-[10px] uppercase tracking-widest font-medium"
          >Home</span
        >
      </a>
      <a
        class="flex flex-col items-center justify-center text-[#e5e2e1]/60 hover:text-[#e5e2e1] transition-all"
        href="#"
      >
        <span class="material-symbols-outlined mb-1">notifications_active</span>
        <span
          class="font-['Inter'] text-[10px] uppercase tracking-widest font-medium"
          >Reminders</span
        >
      </a>
      <a
        class="flex flex-col items-center justify-center text-[#7dffa2] after:content-[''] after:w-1 after:h-1 after:bg-[#7dffa2] after:rounded-full after:mt-1 scale-110 duration-300 ease-out"
        href="#"
      >
        <span class="material-symbols-outlined mb-1"
          >account_balance_wallet</span
        >
        <span
          class="font-['Inter'] text-[10px] uppercase tracking-widest font-medium"
          >Budget</span
        >
      </a>
    </nav>
    <!-- FAB Suppression: Per guidelines, no FAB on Budget/Details screens -->
  </body>
</html>
```
